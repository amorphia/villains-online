let Faction = require( './Faction' );


class Hackers_mole_version extends Faction {
    name = 'hackers';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.focus = 'skills-focus';
        this.data.title = "The Kaos Klub";
        this.data.baseMaxEnergy = this.data.maxEnergy = 8;

        // tokens
        this.tokens['boot-up'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'boot-up',
                cost: 0,
                resource : 1
            }
        };


        // units
        this.units['goon'].count = [3];
        this.units['mole'].count = [3];
        this.units['talent'].count = [8];

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


    processUpgrade( upgrade ){
        this.data.maxEnergy = this.data.baseMaxEnergy + upgrade;
    }


    async onAfterSkill( faction, area, units ){
        let player = {}, data = {};

        // Zero Day Exhaust ability
        if( faction.name === this.name ){
            let zeroDay = this.data.units.find( unit => unit.type === 'champion' && _.unitInArea( unit, area ) );
            if( zeroDay ){
                try {
                    await this.exhaustEnemyUnitsInArea( area );
                } catch( error ){
                    console.error( error );
                }
            }
        } else {
            let mole = this.data.units.find( unit => unit.type === 'mole' && _.unitInArea( unit, area ) );
            if( mole && ! this.hasUsedSkill( area ) ){
                // prompt player to select a unit
                [player, data] = await this.game().promise({
                    players: this.playerId,
                    name: 'double-resolve',
                    data: {
                        area : area.name
                    }
                }).catch( error => console.error( error ) );

                if( !data.doubleResolve ){
                    this.message({ message: `The hackers decline to resolve the ${area.name} skill`, faction : this });
                    return;
                }

                await this.useSkill( area );
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
        return !! this.data.units.find( unit => _.unitInArea( unit, area )
            && ( unit.skilled || ( unit.type === 'patsy' && this.controlsArea( 'university' ) ) )
            && !unit.ready );
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

}


module.exports = Hackers_mole_version;
