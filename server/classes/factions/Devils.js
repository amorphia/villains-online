let Faction = require( './Faction' );


class Devils extends Faction {
    name = 'devils';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
            "onCleanUp" : "resetChaos",
            "onFactionKillsUnit" : "checkKillChaos",
        };

        // data
        this.data.focusDescription = "Sow chaos by killing units without attacking with our units";
        this.data.name = this.name;
        this.data.title = "The Laughter in the Dark";
        this.data.chaos = 0; // tracks how may kills we have that aren't from attacking with our units
        this.data.chaosLevel = '';
        this.data.cardLimit = 2;

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
                type : 'battle',
                resource : 1,
                cost : 0,
                description: "Treat as a basic BATTLE token in every way, except if you have no units here when you successfully activate this token draw an action card, and all units killed in this battle count as your kills",
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
                cost: 0,
                killed : false,
                hidden: true,
                onDeploy: 'deployCheckIfDelighted',
                onBeforeBattle: 'increaseCombatAttack',
                //onSkill: 'princeLootCards',
                //skilled : true,
                //ready : false,
                dontUnflipAutomatically: true,
                selected : false,
                hitsAssigned : 0,
            }
        };
    }


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        this.data.stokeBattles = upgrade + 1;
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
            this.becomesDelighted();
            this.data.chaosLevel = "pandemonium";
            levelText = ": <span class='highlight'>PANDEMONIUM</span>";
        }

        this.message( `Have achieved chaos level ${this.data.chaos}${levelText}` );
    }

    increaseCombatAttack( combat ){
        combat.data.attackBonus += 2;
    }

    /**
     * Handle our Dr T attack trigger
     *
     * @param event
     */
    deployCheckIfDelighted( event ) {
        if(event.unit.flipped || !this.hasChaosLevel("pandemonium")) return;
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
