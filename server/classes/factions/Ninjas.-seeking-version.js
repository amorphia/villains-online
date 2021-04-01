let Faction = require( './Faction' );


class Ninjas extends Faction {
    name = 'ninjas';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onBeforeBattle" : "resetFirstAttack",
            "onAfterBattle" : "revealHiddenUnits",
            "onAfterTokenReveal" : "lotusDancerMove"
        };

        //data
        this.data.name = this.name;
        this.data.focus = 'kill-types-focus';
        this.data.focusDescription = "Kill different unit types";
        this.data.title = "The Clan of the Pale Moon";
        this.data.bladesBonusDice = 0;
        this.data.firstAttackThisBattle = false;
        this.data.flipableUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];

        // icons
        this.data.statusIcon = 'hidden';
        this.data.statusDescription = 'has hidden unit';

        // tokens
        this.tokens['blades'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'blades',
                resource: 1,
                cost: 0,
                req : "This token must be discarded if you can't make an attack with a unit"
            }
        };

        // units
        this.units['patsy'].data.attack = [7];
        this.units['patsy'].data.hidden = false;
        this.units['talent'].data.attack = [5];
        this.units['talent'].data.hidden = false;
        this.units['mole'].data.attack = [7];
        this.units['mole'].data.hidden = false;
        this.units['goon'].data.hidden = false;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Lotus Dancer",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [4],
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                hidden : false
            }
        };
    }

    battleOrderSort( combatFactions ) {
        combatFactions.sort( (a,b) => {
            if( a.name === this.name ) return -1;
            if( b.name === this.name ) return 1;
            return a.order - b.order
        });
    }

    factionCombatMods( mods, area ) {
        mods.push({
            type: 'ninjas',
            text: `The Ninjas attack first in player order, their first successful attack can't be stopped by patsies and the attacker becomes hidden`
        });

        mods.push({
            type: 'hidden',
            text: `Hidden units may not be assigned hits, at the end of combat units lose hidden`
        });

        return mods;
    }

    processUpgrade( n ) {
        this.data.bladesBonusDice = n;
    }

    resetFirstAttack( battle ){
        this.data.firstAttackThisBattle = true;
    }

    async lotusDancerMove( token ){
        let player, data;

        let lotusDancer = this.data.units.find( unit => unit.type === 'champion' && _.unitInPlay( unit ) );
        if( token.type !== 'battle' || !lotusDancer ) return;

        let lotusDancerArea = this.game().areas[ lotusDancer.location ];
        let area = this.game().areas[ token.location ];

        // check if lotus dancer can't legally move
        if( lotusDancerArea.isTrapped( this ) // if she's trapped
            || !area.data.adjacent.includes( lotusDancer.location ) // if she's not adjacent
            || area.hasKau() // if kau is in the destination
        ) return;

        this.game().message({ faction: this, message: 'Lotus dancer deciding whether to enter the frey' });

        // prompt player to select a unit
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'question',
            data: { message: `Move lotus dancer from the ${lotusDancer.location} to the ${area.name}?` }
        }).catch( error => console.error( error ) );

        if( !data.answer ) return this.game().message({ faction: this, message: 'Lotus dancer declines to get involved' });

        lotusDancer.location = token.location;
        this.game().sound( 'wiff' );
        this.game().message({ faction : this, message: `Lotus Dancer slips into the ${token.location}` });

        await this.game().timedPrompt('units-shifted', {
            message : `Lotus Dancer slips into the ${token.location}`,
            units: lotusDancer
        }).catch( error => console.error( error ) );

    }

    hasNonHiddenUnitsInArea( area ){
        return !! this.data.units.find( unit => _.unitInArea( unit, area, { notHidden : true } ) );
    }

    revealHiddenUnitsInArea( combat ) {
        let hiddenUnits = this.data.units.filter( unit => unit.hidden && _.unitInArea( unit, combat.area ) );
        hiddenUnits.forEach( unit => this.unflipUnit( unit ) );

        if( hiddenUnits.length ) this.game().message({ faction : this, message: `hidden units in The ${combat.area.name} are revealed` });
    }

    canActivateBlades( token, area ) {
        return this.hasUnitsInArea( area ) && area.canBattle();
    }


    async bladesToken( args ) {
        let data, player;

        // prompt player to select a unit
        [player, data] = await this.game().promise({
                players: this.playerId,
                name: 'choose-units',
                data: {
                    count : 1,
                    areas : [args.area.name],
                    hasAttack: true,
                    playerOnly : true,
                    showEnemyUnits: true,
                    message: "Choose a unit to make an attack",
                    gainsSeeking : true
                }
            }).catch( error => console.error( error ) );

        let unit = this.game().objectMap[ data.units[0] ];

        // resolve attack with that unit
        let attackArea = this.game().areas[ unit.location ];
        let output = await this.attack({
            area : attackArea,
            attacks : unit.attack,
            unit : unit,
            noDecline : true,
            seeking: true,
            bonusDice: this.data.bladesBonusDice
        });

        if( output ){
            await this.game().timedPrompt('noncombat-attack', { output : [output] } )
                .catch( error => console.error( error ) );
        }

        this.game().advancePlayer();
    }

    becomeHidden( unit ) {
        if( !unit.flipped && !unit.killed ){
            unit.flipped = true;
            unit.hidden = true;
            let message = `<span class="faction-ninjas">${unit.name}</span> becomes hidden in The ${unit.location}`;
            this.message({ message: message, faction : this });
        }
    }

    unflipUnit( unit ) {
        unit.flipped = false;
        unit.hidden = false;
    }

}


module.exports = Ninjas;
