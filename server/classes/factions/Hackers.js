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
        this.data.focusDescription = "Activate many area skill abilities";
        this.data.hax0red = []; // areas we have used our hax0red ability this game

        this.data.showReadyPips = true;
        this.data.title = "The Kaos Klub";
        this.data.exhaustSingleUnit = true;
        this.data.hax0redMarkers = 0;
        this.data.usedHax0redMarkers = 0;

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
                description: "Ready each of your skilled units in this area, then take another action",
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
        this.data.hax0redMarkers = (upgrade * 2) - this.data.usedHax0redMarkers;
    }


    /**
     * Allow a player to choose if they want to double resolve this skill ability
     *
     * @param area
     * @param exhaustedUnits
     */
    async shouldHax0rArea( area, exhaustedUnits ){

        // if we have already hax0red this area, or have no markers then we can't do it again
        if( this.data.hax0red.includes( area.name ) || this.data.hax0redMarkers < 1 ) return;

        // ask the player if they want to double resolve this skill
        let response = await this.prompt( 'double-resolve', { markers : this.data.hax0redMarkers, area : area.name });


        // I guess not
        if( !response.doubleResolve ){
            this.message(`The hackers decline to resolve the ${area.name} skill twice` );
            return { doubleResolve : false };
        }

        // flag this area
        this.data.hax0red.push( area.name );
        this.data.hax0redMarkers--;
        this.data.usedHax0redMarkers++;
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

        // if we can't activate this skill, abort
        if(this.data.usedSkills.includes(area.name)){
            return;
        }

        // prompt player to decide to move lotus dancer
        let response = await this.prompt( 'question', {
            message: `Activate the skill ability of the ${area.name}?`
        });

        if ( !response.answer ) return this.message( `Zero Day declines to hack the ${area.name}?` );

        await this.useSkill( area, { noExhaust: true });
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
        return this.data.units.some( unit => _.unitInArea( unit, area, { skilled : true, notReady : true } ));
    }


    /**
     * Handle boot up token activation
     *
     * @param args
     */
    async activateBootUpToken( args ) {

        // ready our skilled units here
        this.data.units
            .filter( unit => _.unitInArea( unit, args.area.name, { skilled : true } ) )
            .forEach( unit => unit.ready = true );

        this.message( `Skilled units became ready in The ${args.area.name}` );
        this.game().advancePlayer( {}, false );
    }

}


module.exports = Hackers;
