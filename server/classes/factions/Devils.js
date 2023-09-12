let Faction = require( './Faction' );


class Devils extends Faction {
    name = 'devils';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
            "onCleanUp" : "resetChaos",
            "onFactionKillsUnit" : "checkKillChaos",
            //"onAfterSkill" : "shouldTormentAfterSkill",
            "onAfterTokenReveal" : "handlePrincePlacement",
        };

        // data
        this.data.focusDescription = "Sow chaos by killing units without attacking with our units";
        this.data.name = this.name;
        this.data.title = "The Laughter in the Dark";
        this.data.chaos = 0; // tracks how may kills we have that aren't from attacking with our units
        this.data.chaosLevel = '';
        this.data.cardLimit = 2;
        this.data.princeCombatBonus = 2;

        // how much chaos we need to achieve each chaos level
        this.data.chaosLevels = {
            strife: 2,
            bedlam: 4,
            pandemonium: 6,
            max: 6,
        };

        this.data.stokeBattles = 1;
        this.data.flipableUnits = ['champion'];

        this.tokens['stoke'] = {
            count: 3,
            data: {
                influence: 1,
                type : 'stoke',
                resource : 1,
                cost : 0,
                description: "Start a battle in this area. If you have no attackers in this battle: draw an action card as the battle begins, then gain one chaos for each enemy unit killed in this battle",
                req : "This token must be discarded if no combat takes place when activating it"
            }
        };

        delete this.tokens['battle'];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "The Gleeful Prince",
                flipped: false,
                type: 'champion',
                basic: false,
                attack: [],
                influence: 2,
                seeking : false,
                noDeploy: true,
                killed : false,
                hidden: true,
                onDeploy: 'deployCheckIfDelighted',
                onPlace: 'deployCheckIfDelighted',
                onBeforeBattle: 'increaseCombatAttack',
                dontUnflipAutomatically: true,
                selected : false,
                hitsAssigned : 0,
            }
        };
    }
    async handlePrincePlacement( token ) {
        // if we didn't reveal the token, abort
        if (token.type !== 'stoke') return;

        let destinationAreaName = token.location;

        // check for areas with vampires (that aren't this area), if we have none, abort
        let prince = this.getChampion();
        if( prince.killed ) return;

        // prompt player to decide to move lotus dancer
        let response = await this.prompt( 'question', {
            message: `Place the Gleeful Prince in the ${destinationAreaName}?`
        });

        if ( !response.answer ) return this.message( 'The Gleeful Prince is happy to stay where he is' );

        // st lotus dancer's new area
        this.placeUnit( prince, destinationAreaName )

        // show results to all players
        this.game().sound('wiff');
        this.message( `The Gleeful Prince jaunted into the ${area.name}` );

        await this.game().timedPrompt('units-shifted', {
            message: `The Gleeful Prince jaunted into the ${area.name}`,
            units: prince
        }).catch(error => console.error(error));
    }

    async shouldTormentAfterSkill( area ){
        // if we don't have our first upgrade abort
        if( !this.data.upgrade ) return;

        let countWording = this.data.upgrade === 1 ? "an attack" : "two attacks";

        //
        let [player, response] = await this.game().promise({
            players: this.playerId,
            name: 'discard-card',
            data : {
                message: `Discard an action card to make ${countWording} of xA5x in the ${area.name}?`,
                count: 1,
                canDecline : true,
            },
        });

        // if we decline, abort
        if ( response.declined ){
            return this.message( `The devils decline to torment the ${area.name}` );
        }

        this.discardCards( response.cards );

        let attackValue = this.data.upgrade === 1 ? [5] : [5,5];
        let output = await this.attack({ area: area, attacks: attackValue });

        if ( output ) {
            await this.game().timedPrompt('noncombat-attack', {output: [output]})
                .catch(error => console.error(error));
        }
    }

    checkKillChaos( unit, options ){
        // if the attack was
        if(options.inCombat || unit.faction === this.name) return;
        this.raiseChaos();
    }

    raiseChaos(){
        if(this.data.chaos >= this.data.chaosLevels.max) return;

        // increment chaos
        this.data.chaos++;
        let levelText = '';

        // apply strife
        if( this.data.chaos === this.data.chaosLevels.strife ){
            this.data.chaosLevel = "strife";
            //this.data.cardLimit++;
            levelText = ": <span class='highlight'>STRIFE</span>";
        }

        // apply bedlam
        if( this.data.chaos === this.data.chaosLevels.bedlam ){
            this.data.chaosLevel = "bedlam";
            levelText = ": <span class='highlight'>BEDLAM</span>";
        }

        // apply pandemonium
        if( this.data.chaos === this.data.chaosLevels.pandemonium ){
            if( this.data.upgrade ) this.becomesDelighted();
            this.data.chaosLevel = "pandemonium";
            levelText = ": <span class='highlight'>PANDEMONIUM</span>";
        }

        this.message( `Have achieved chaos level ${this.data.chaos}${levelText}` );
    }

    increaseCombatAttack( combat ){
        let upgradeBonus = this.data.upgrade >= 2 ? 1 : 0;
        combat.data.attackBonus += this.data.princeCombatBonus + upgradeBonus;
    }

    /**
     * Handle our Dr T attack trigger
     *
     * @param event
     */
    deployCheckIfDelighted( event ) {
        if(event.unit.flipped || !this.hasChaosLevel("pandemonium") || !this.data.upgrade) return;
        this.becomesDelighted( event.unit );
    }


    becomesDelighted( unit = null ){
        unit = unit ?? this.getChampion();
        if(unit.flipped) return;

        unit.flipped = true;
        //unit.seeking = true;
        //unit.attack = [6,6,6];
        unit.influence = 4;

        //if( this.game().combat ) this.game().combat.addUnitToCombat( unit );

        this.message("The Gleeful Prince becomes delighted" );
    }


    /**
     * Return our knighted units to normal
     *
     * @param unit
     */
    unflipUnit( unit = null ) {
        unit = unit ?? this.getChampion();

        if(!unit.flipped) return;

        unit.flipped = false;
        unit.seeking = false;
        unit.attack = [];
        unit.influence = 2;

        this.message("The Gleeful Prince is no longer delighted" );
    }

    princeLootCards( event ) {
        //if( !this.hasChaosLevel("bedlam") ) return this.message( "Has not achieved bedlam", { class: 'warning' } );
        if( !this.data.cards.hand.length ) return this.message( "Has no cards to discard", { class: 'warning' } );

        return this.game().promise({
            players: this.playerId,
            name: 'discard-card',
            data : {
                message: "Discard any number of cards to draw that many cards",
                unlimited: true,
                canDecline : true,
            },
        }).then( ([player, response]) => this.resolveDiscard( response ) );
    }

    resolveDiscard(response){
        if(response.decline) return;

        this.discardCards( response.cards );
        this.drawCards( response.cards.length, true );
    }

    hasChaosLevel( level ) {
        return this.data.chaos >= this.data.chaosLevels[level] ?? 100;
    }

    /**
     * Reset our chaos count for the turn
     */
    resetChaos(){
        // reset strife bonus
        if( this.data.chaos >= this.data.chaosLevels.strife ){
            //this.data.cardLimit--;
        }

        // reset pandemonium bonus
        this.unflipUnit();

        // reset chaos related data
        this.data.chaos = 0;
        this.data.chaosLevel = '';
    }

    /**
     * Can we activate this card token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateStoke( token, area ){
        return this.canActivateBattle( token, area );
    }

    collectStokeChaos(unit){
        if(unit.faction !== this.name){
            this.raiseChaos();
        }
    }

    /**
     * Handle activating our Mr. Fusion token
     *
     * @param args
     */
    async activateStokeToken( args ){
        let battles = 0;
        let stokingTheFlames = !this.hasUnitsInArea( args.area, { withAttack : true } );
        let options = {};

        if( stokingTheFlames ){
            this.message( "Is stoking the flames of hate and violence" );
            this.drawCards( 1, true );
            options.onCombatDeath = { method: 'collectStokeChaos', faction: this };
        }

        // keep playing cards until we decide to stop
        while( battles < this.data.stokeBattles ) {
            // resolve a battle in this area
            await this.game().battle( args.area, options );
            battles++;
        }

        // advance the game
        this.game().advancePlayer();
    }

}

module.exports = Devils;
