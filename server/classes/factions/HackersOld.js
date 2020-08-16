let Faction = require( './Faction' );


class Hackers extends Faction {
    name = 'hackers';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.focus = 'skills-focus';
        this.data.title = "The Kaos Klub";

        // icons
        this.data.statusIcon = 'leet';
        this.data.statusDescription = 'has l33t unit';

        // tokens
        this.tokens['boot-up'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'boot-up',
                resource: 1,
                cost: 0,
            }
        };

        // units
        this.units['goon'].count = [3];
        this.units['mole'].count = [3];
        this.units['talent'].count = [8];
        this.units['talent'].data.flipped = false;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Zero Day",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [8,8],
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };
    }

    factionCombatMods( mods, area ) {

        if( this.data.upgrade ){
            mods.push({
                type: 'talents',
                text: `Talents throw ${this.data.upgrade} additional dice`
            });
        }

        return mods;
    }

    processUpgrade( upgrade ){
        this.data.units.forEach( unit => {
            if( unit.type === 'talent' ){
                unit.attack = upgrade === 1 ? [5] : [3];
            }
        });
    }


    async onAfterSkill( area, units ){


        // double skill
        let leetTalent = units.find(
            unit => unit.unit.type === 'talent'
                    && unit.unit.flipped
        );

        if( leetTalent ){
            this.game().message({ message: `double activates the skill ability of the ${area.name}`, faction : this });

            try {
                await area.skill( this );
            } catch( error ){
                console.error( error );
            }
        }

        // make leet unit
        let unLeetTalent = units.find(
            unit => unit.unit.type === 'talent'
                    && !unit.unit.flipped
        );

        if( unLeetTalent ) this.becomeLeet( unLeetTalent.unit );

        // exhaust enemy units
        let zeroDay = this.data.units.find( unit => unit.type === 'champion' && _.unitInArea( unit, area ) );
        if( zeroDay ){
            try {
                await this.exhaustEnemyUnitsInArea( area );
            } catch( error ){
                console.error( error );
            }
        }
    }

    async exhaustEnemyUnitsInArea( area ){
        let units = [];

        Object.values( this.game().data.factions ).forEach( faction => {
            faction.units.forEach( unit => {
                if( unit.skilled
                    && unit.ready
                    && unit.basic
                    && unit.location === area.name
                ){
                    unit.ready = false;
                    units.push( unit );
                }
            })
        });

        if( units.length ){
            this.message({ message: `Zero day exhausts all enemy units in The ${area.name}`, faction : this } );
            await this.game().timedPrompt('units-shifted', {
                message : `Zero day hijacks ready enemy units in The ${area.name}`,
                units: units
            }).catch( error => console.error( error ) );
        }
    }

    canActivateBootUp( token, area ) {
        return !! this.data.units.find( unit => _.unitInArea( unit, area ) && unit.skilled && !unit.ready );
    }

    async bootUpToken( args ) {

        let skilledPatsies = this.controlsArea( 'university' );

        this.data.units
            .filter( unit => _.unitInArea( unit, args.area.name )
                && ( unit.skilled || ( skilledPatsies && unit.type === 'patsy' ) ) )
            .forEach( unit => unit.ready = true );

        this.message({ message: `Skilled units became ready in The ${args.area.name}`, faction : this } );
        this.game().advancePlayer();
    }

    becomeLeet( unit ) {
        if( !unit.flipped && !unit.killed ){
            unit.flipped = true;
            unit.influence = 2;
            let message = `${unit.name} becomes l33t in The ${unit.location}`;
            this.message({ message: message, faction : this });
        }
    }

    unitUnflipped( unit ) {
        unit.flipped = false;
        unit.influence = 1;
    }

}


module.exports = Hackers;
