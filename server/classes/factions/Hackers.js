let Faction = require( './Faction' );


class Hackers extends Faction {
    name = 'hackers';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
            "onBeforeSkill" : "shouldHax0rArea"
        };

        //data
        this.data.name = this.name;
        this.data.focus = 'skills-focus';
        this.data.focusDescription = "Activate many area skill abilities";
        this.data.hax0red = []; // areas we have used our hax0red ability this game

        this.data.title = "The Kaos Klub";
        this.data.baseMaxEnergy = this.data.maxEnergy = 8;

        this.capturedRewards = [
            { ap : 1, cardDraw : 1 },
            { ap : 1, cardDraw : 1 },
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
                resource: 1,
                req : "This token must be discarded if you can't ready any exhausted units with it"
            }
        };


        // units
        this.units['goon'].count = [4];
        this.units['mole'].count = [4];
        this.units['talent'].count = [8];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Zero Day",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [8,8],
                cost: 0,
                skilled : true,
                ready : false,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onDeploy: 'exhaustEnemyUnitsInArea',
                onMove: 'exhaustEnemyUnitsInArea',
            }
        };
    }


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        this.data.maxEnergy = this.data.baseMaxEnergy + upgrade;
    }


    /**
     * Allow a player to choose if they want to double resolve this skill ability
     *
     * @param area
     */
    async shouldHax0rArea( area ){
        // if we have already hax0red this area then we can't do it again
        if( this.data.hax0red.includes( area.name ) ) return;

        // ask the player if they want to double resolve this skill
        let response = await this.prompt( 'double-resolve', { count : 1, area : area.name });

        // I guess not
        if( !response.doubleResolve ){
            this.message(`The hackers decline to resolve the ${area.name} skill twice` );
            return { doubleResolve : false };
        }

        // flag this area
        this.data.hax0red.push( area.name );
        this.message(`The hackers resolve the ${area.name} skill twice` );
        return { doubleResolve : true };
    }


    /**
     * Handle Zero Day's enter area trigger to exhaust all enemy units
     *
     * @param event
     */
    async exhaustEnemyUnitsInArea( event ){
        let  area = this.game().areas[event.unit.location];

        // exhaust enemy units in this
        let units = this.resolveExhaustReadyEnemyUnitsInArea( area );
        if( !units.length ) return;

        // display results to all players
        this.message(`Zero day exhausts all enemy units in The ${area.name}` );
        await this.game().timedPrompt('units-shifted', {
            message : `Zero day exhausts enemy units in The ${area.name}`,
            units: units
        }).catch( error => console.error( error ) );

    }


    /**
     * Actually do the exhausting of enemy units in this area
     *
     * @param area
     * @returns {Unit[]}
     */
    resolveExhaustReadyEnemyUnitsInArea( area ){
        let units = [];

        // cycle through each faction
        Object.values( this.game().data.factions ).forEach( faction => {
            // don't exhause our own units
            if( faction.name === this.name ) return;

            // cycle through this faction's units
            faction.units.forEach( unit => {
                // if this unit is ready and in this area then exhaust it and add it to our collection
                if ( unit.ready && unit.location === area.name ) {
                    unit.ready = false;
                    units.push(unit);
                }
            });
        });

        return units;
    }


    /**
     * Can we active our boot up token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateBootUp( token, area ) {
        // do we have any unready killed units in this area?
        return !! this.data.units.find( unit => _.unitInArea( unit, area )
            && ( unit.skilled )
            && !unit.ready );
    }


    /**
     * Handle boot up token activation
     *
     * @param args
     */
    async activateBootUpToken( args ) {

        // ready our skilled units here
        this.data.units
            .filter( unit => _.unitInArea( unit, args.area.name ) && unit.skilled )
            .forEach( unit => unit.ready = true );

        this.message( `Skilled units became ready in The ${args.area.name}` );
        this.game().advancePlayer();
    }

}


module.exports = Hackers;
