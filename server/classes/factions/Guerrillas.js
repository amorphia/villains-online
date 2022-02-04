let Faction = require( './Faction' );


class Guerrillas extends Faction {
    name = 'guerrillas';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onCleanUp" : "resetAmbushUsedCount",
            "onStartOfTurn" : "setViperDeployLimit",
        };


        //data
        this.data.name = this.name;
        this.data.title = "The People's Alliance";
        this.data.focusDescription = "Kill many units in enemy areas";
        this.data.flipableUnits = ['champion'];

        // tracks the number of ambush actions we have available each turn
        this.data.ambushes = {
            max : 1,
            used : 0,
        };

        // tokens
        delete this.tokens['battle'];

        this.tokens['snipers'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'snipers',
                resource: 1,
                cost: 0,
                req : "This token must be discarded if you cannot make an attack with it"
            }
        };

        // units
        this.units['goon'].count = 4;
        //this.units['goon'].data.redeployFree = true;

        this.units['talent'].count = 4;
        //this.units['talent'].data.redeployFree = true;
        this.units['talent'].data.attack = [7, 7];

        this.units['mole'].count = 4;
        //this.units['mole'].data.redeployFree = true;

        this.units['patsy'].count = 6;
        this.units['patsy'].data.attack = [9, 9];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Red Viper",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [7, 7],
                cost: 1,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                toughness: true,
                flipped: false,
                onDeploy: 'viperDeploy'
            }
        };
    }


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
       this.data.ambushes.max = upgrade + 1;
    }


    /**
     * Can we activate our sniper token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateSnipers( token, area ) {
        // do we have a valid target?
        let validTargets = !! this.areasWithEnemyUnits({}, area.name ).length;
        // do we have a unit in this area to be our trigger man
        let hasUnitToShootWith = this.hasUnitsInArea( area );
        return validTargets && hasUnitToShootWith;
    }


    /**
     * Handle activating our sniper token
     *
     * @param args
     */
    async activateSnipersToken( args ) {
        let area = args.area;

        // get areas with units
        let areas = this.areasWithEnemyUnits({}, area.name );

        // if there are no targets we are donezo here
        if ( ! areas.length ) {
            this.message( "snipers couldn't find a target", { class: 'warning' } );
            return;
        }

        this.message(`Snipers are searching for targets` );

        // prompt player to select an area to snipe
        let response = await this.prompt( 'choose-area',  {
            areas: areas,
            show: 'units',
            enemyOnly: true,
            message: "Choose an area to target with your sniper attack of xA1x"
        });

        let targetArea = this.game().areas[response.area];

        // resolve attack with that unit
        let output = await this.attack({ area: targetArea, attacks: [1] });

        if ( output ) {
            await this.game().timedPrompt('noncombat-attack', {output: [output]})
                .catch(error => console.error(error));
        }

        this.game().advancePlayer();
    }


    /**
     * Handle our ambush action
     *
     * @param player
     * @param areaName
     */
    async takeAmbushAction( player, areaName ){

        // show popup
        this.game().popup( this.playerId, { type: 'ambush', area : areaName, faction : this.name });

        let area = this.game().areas[areaName];

        try {
            await this.resolveAmbushAction( area );
        } catch( error ){
            console.error( error );
        }

        this.game().advancePlayer();
    }


    /**
     * Resolve our ambush action
     *
     * @param area
     */
    async resolveAmbushAction( area ){

        // if we don't have any ambushes left, or any revealed tokens to discard here then we can't resolve this action
        if( (this.data.ambushes.used >= this.data.ambushes.max) || !this.hasRevealedTokenInArea( area ) ) {
            this.message( `Can't ambush in the ${ area.name }`, { class: 'warning' } );
            return;
        }

        // chose our token to discard
        let response = await this.prompt( 'choose-tokens', {
            count : 1,
            areas : [area.name],
            playerOnly : true,
            revealedOnly : true
        });

        let token = this.game().objectMap[response.tokens[0]];
        if( !token ) return this.message( `Declines to ambush in the ${ area.name }`, { class: 'warning' });

        // use up an ambush
        this.data.ambushes.used++;

        _.discardToken( token, area );

        this.message(`Launches an ambush in the ${ area.name }`,{ class: 'highlight' });

        // begin a battle in this area
        await this.game().battle( area ).catch( error => console.error( error ) );
    }


    /**
     * Do we have a revealed token in the area?
     *
     * @param area
     * @returns {boolean}
     */
    hasRevealedTokenInArea( area ){
        return area.data.tokens.some( token => token.faction === this.name && token.revealed );
    }


    /**
     * Handle viper deploy trigger
     *
     * @param event
     */
    async viperDeploy( event ){
        // viper is no longer free to our deploy limit
        this.toggleViperDeployLimit( false );

        // handle bring units trigger
        await this.bringUnits( event );
    }


    /**
     * Add or remove the free deploy limit on Red Viper
     *
     * @param set
     */
    toggleViperDeployLimit( set = true ){
        if( set ) this.data.bonusDeploy = { type: 'champion', count : 1 };
        else delete this.data.bonusDeploy;
    }


    /**
     * Handle our end of turn viper deploy limit trigger
     */
    setViperDeployLimit(){
        // if red viper is in our reserves, then she is free to deploy again next turn
        let viperInReserves = this.data.units.find( unit => unit.type === 'champion' && !unit.location );
        if( viperInReserves ) this.toggleViperDeployLimit( true );
    }


    /**
     * Handle Red Viper's bring units ability
     *
     * @param event
     */
    async bringUnits( event ) {
        let area = this.game().areas[ event.from  ];

        // if we didn't deploy from another area then return
        if (!event.from || event.from === event.unit.location) return;

        // if we don't have any more units in the from area then return
        if( ! this.data.units.find( unit => _.unitInArea( unit, event.from ) ) ) return;

        // if the plants are in this game, check for vines
        let vines = area.data.tokens.filter( token => token.type === 'vines' ).length;

        // Let player choose which units to bring, if any
        let response = await this.prompt( 'choose-units', {
            count : 2,
            areas : [event.from],
            playerOnly : true,
            canDecline : true,
            optionalMax : true,
            policePayoff : event.unit.location,
            vines: vines,
            message: `Choose units to move with Red Viper to The ${event.from}`
        });

        if( response.decline ) return;

        console.log( 'bringUnits response', response );

        // bring our units along
        await this.resolveBringUnits( response.units, response.cost, event );


    }


    /**
     * Actually move the units we decided to bring with red viper
     *
     * @param units
     * @param cost
     * @param event
     */
    async resolveBringUnits( units, cost, event ){

        // pay any costs to move these units
        if( cost ) this.payCost( cost );

        // grab the units from our object map
        units = units.map( unitId => this.game().objectMap[ unitId ] );

        // move our units
        units.forEach( unit => {
            unit.location = event.unit.location;
            if( unit.ready ) unit.ready = false;
        });

        // display results
        this.message( `Sneaks ${units.length} unit${units.length > 1 ? 's':'' } to The ${event.unit.location}` );
        await this.game().timedPrompt('units-shifted', {
            message : `${units.length === 1 ? 'A Unit sneaks' : 'Units sneak'} to The ${event.unit.location}`,
            units: units
        });
    }


    /**
     * handle end of turn reset ambush trigger
     */
    resetAmbushUsedCount(){
        this.data.ambushes.used = 0;
    }


}




module.exports = Guerrillas;
