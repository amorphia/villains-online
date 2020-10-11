let Faction = require( './Faction' );


class Hackers extends Faction {
    name = 'hackers';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.focus = 'skills-focus';
        this.data.focusDescription = "Activate many area skill abilities";
        this.data.hax0red = [];

        this.data.title = "The Kaos Klub";
        this.data.baseMaxEnergy = this.data.maxEnergy = 9;

        this.capturedRewards = [
            { ap : 1, cardDraw : 1 },
            { ap : 1 },
            { ap : 1 },
            { ap : 2 }
        ];


        // tokens
        this.tokens['boot-up'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'boot-up',
                cost: 0,
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


    async onBeforeSkill( area ){
        let player = {}, data = {};
        if( this.data.resources <= 0 || this.data.hax0red.includes( area.name ) ) return this.game().message({ message: `Hackers can't double the skill ability in the ${area.name}`, class : 'warning'});

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'double-resolve',
            data: {
                count : 1,
                area : area.name
            }
        }).catch( error => console.error( error ) );

        if( !data.doubleResolve ){
            this.message({ message: `The hackers decline to resolve the ${area.name} skill twice`, faction : this });
            return;
        }

        this.data.resources--;
        this.data.hax0red.push( area.name );
        this.message({ message: `The hackers pay xRx to resolve the ${area.name} skill twice`, faction : this });
        return { doubleResolve : true };
    }

    async onAfterSkill( area, units ){
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


module.exports = Hackers;
