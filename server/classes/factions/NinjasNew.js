let Faction = require( './Faction' );


class Ninjas extends Faction {
    name = 'ninjas';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.focus = 'kill-types-focus';
        this.data.focusDescription = "Kill different unit types";
        this.data.title = "The Clan of the Pale Moon";
        this.data.bladesBonusDice = 0;
        this.data.hasHitThisBattle = false;

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
            }
        };

        // units
        this.units['patsy'].data.attack = [7];
        this.units['patsy'].data.hidden = false;
        this.units['talent'].data.hidden = false;
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

    factionCombatMods( mods, area ) {
        mods.push({
            type: 'ninjas',
            text: `The Ninjas attack first in player order, and may skip their normal attacks to make a special targeted attack`
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


    async onAfterReveal( token ){
        let lotusDancer = this.data.units.find( unit => unit.type === 'champion' && _.unitInPlay( unit ) );
        if( token.type !== 'battle' || !lotusDancer ) return;

        let lotusDancerArea = this.game().areas[ lotusDancer.location ];
        let area = this.game().areas[ token.location ];

        if( !lotusDancerArea.isTrapped( this ) && area.data.adjacent.includes( lotusDancer.location ) ){
            lotusDancer.location = token.location;
            this.game().sound( 'wiff' );
            this.game().message({ faction : this, message: `Lotus Dancer slips into the ${token.location}` });

            await this.game().timedPrompt('units-shifted', {
                message : `Lotus Dancer slips into the ${token.location}`,
                units: lotusDancer
            }).catch( error => console.error( error ) );
        }
    }

    hasNonHiddenUnitsInArea( area ){
        return !! this.data.units.find( unit => _.unitInArea( unit, area, { notHidden : true } ) );
    }

    onAfterBattle( combat ) {
        let hiddenUnits = this.data.units.filter( unit => unit.hidden && _.unitInArea( unit, combat.area ) );
        hiddenUnits.forEach( unit => this.unitUnflipped( unit ) );

        if( hiddenUnits.length ) this.game().message({ faction : this, message: `hidden units in The ${combat.area.name} are revealed` });
    }

    canActivateBlades( token, area ) {
        return this.hasUnitsInArea( area );
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
                    message: "Choose a unit to make an attack"
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

    unitUnflipped( unit ) {
        unit.flipped = false;
        unit.hidden = false;
    }

}


module.exports = Ninjas;
