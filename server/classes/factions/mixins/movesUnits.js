let obj = {

    /**
     * Can we activate our move token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateMove( token, area ){
        return this.money() >= token.cost && this.moveFromAreas( { area:area, fromToken: true } ).length > 0;
    },


    /**
     * Activate a move token
     *
     * @param args
     */
    async activateMoveToken( args ) {

        // make sure our move action knows this comes from a card
        args.fromToken = true;

        // resolve move action
        let output = await this.move( args ).catch( error => console.error( error ) );

        // if we declined to move any units, discard this token
        if( output?.declined ){
            if( !args.pod ) this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        // handle onActivateToken triggers
        await this.handleAfterActivateTokenTriggers( args );

        // advance the game
        this.game().advancePlayer()
    },


    /**
     * Begin a move action
     *
     * @param args
     */
    async move( args ){
        // get the areas we can move from
        let fromAreas = this.moveFromAreas( args );
        if( !fromAreas.length ){
            this.message( 'No valid moves', { class : 'warning' } );
            return;
        }

        let data = {
            toArea : args.area.name,
            fromAreas : fromAreas,
            fromToken : args.fromToken,
            moveLimit : args.moveLimit,
            reduceCost : args.reduceCost,
            canDecline : args.canDecline,
        };

        // prompt our player to choose units to move
        let response = await this.prompt( 'move-action', data )
            .catch( error => console.error( error ) );

        // resolve our move
        return await this.resolveMove( response )
            .catch( error => console.error( error ) );
    },


    /**
     * Get the areas we can move from
     *
     * @param args
     * @returns {*}
     */
    moveFromAreas( args = {} ){
        let destinationArea = typeof args.area === 'string' ? this.game().areas[args.area] : args.area;

        // get our potential areas
        let areas = this.getMovePotentialAreas( args, destinationArea );

        // filter invalid areas
        return areas.filter( area => this.isAreaValidToMoveFrom( area, destinationArea ) );
    },


    /**
     * Get the areas we can even potentially move from, given any adjacency restrictions
     *
     * @param args
     * @param area
     * @returns {Area[]}
     */
    getMovePotentialAreas( args, area ) {
        // if we can farMove return all areas but the given one
        if ( args.farMove || ( this.data.farMove && args.fromToken ) ) {
            let areas = this.game().data.areaOrder.slice();
            return areas.filter( area => area !== args.area.name );
        }

        // otherwise our move is limited to adjacency return areas adjacent to the given area
        return args.area.data.adjacent.slice()
    },


    /**
     * Checks if this area is valid to move from
     *
     * @param area
     * @param destinationArea
     * @returns {boolean}
     */
    isAreaValidToMoveFrom( area, destinationArea ){
        let kauInDestination = destinationArea.hasKau() && this.name !== 'aliens';

        // do we have any valid units (i.e. ones in this area, ?
        let hasUnits = this.data.units.some(
            unit => _.unitInArea( unit, area, { notWebbed : true } ) && !unit.noMove && ( !kauInDestination || (unit.type !== 'champion' && !unit.isChampion) )
        );

        // is the area trapped?
        let isTrapped = _.areaIsTrapped( this, this.game().areas[area] );
        return hasUnits && !isTrapped;
    },


    /**
     * Resolve a move
     *
     * @param response
     * @returns {Promise<{declined: boolean}|{cost: *, units: []}>}
     */
    async resolveMove( response ){
        if( response.decline ) return { declined : true };

        let units = [];
        let output = { cost : response.cost,  units : [] };

        // pay any additional costs
        this.payCost( response.cost );

        // for each unit, move that unit
        response.units.forEach( unitId => this.resolveMoveUnit( unitId, units, output, response ) );

        // send move log message
        await this.outputMoveMessage( output, response, units );

        // handle any unit move triggers
        await this.unitTriggeredEvents( 'move', output.units )
            .catch( error => console.log( error ) );

        // check for global events
        for(let faction of Object.values(this.game().factions) ){
            if(faction.triggers?.onMoveAll){
                 await faction[ faction.triggers.onMoveAll ]( output );
            }
        }

        return output;
    },


    /**
     * Handle actually moving a unit
     *
     * @param unitId
     * @param units
     * @param output
     */
    resolveMoveUnit( unitId, units, output, response ){
        // get our unit object
        let unit = this.game().objectMap[unitId];

        // add this unit to our units array
        units.push( unit );

        // and to our output array
        output.units.push({
            from : unit.location,
            unit : unit
        });

        // update area
        unit.location = response.toArea;

        // un-ready units
        if( unit.ready && unit.faction !== 'hackers' ) unit.ready = false;
    },


    /**
     * Send our move message to the game log
     *
     * @param output
     * @param response
     * @param units
     */
    async outputMoveMessage( output, response, units ){
        let unitNames = output.units.map( data => data.unit.name );
        let message = ` <span class="faction-${this.name}">${ unitNames.join(', ') }</span> to the ${output.units[0].unit.location}`;

        if( response.cost ){
            message = `Pay xC${output.cost}x to move` + message;
        } else {
            message = 'Moves' + message;
        }

        // post log message
        this.message( message );

        // if we don;t want to show our units shifted prompt, abort here
        if( response.hidePrompt ) return;

        // show units shifted prompt
        await this.game().timedPrompt('units-shifted', {
                message : `The ${this.name} move units to the ${response.toArea}`,
                units: units,
            }).catch( error => console.error( error ) );
    },


    /**
     * Handle a move away token
     *
     * @param args
     * @param options
     */
    async moveAwayToken( args, options ){
        let data = {}, player;

        // allow a player to make their move away choices
        let response = await this.prompt( 'move-away', options )
            .catch( error => console.error( error ) );

        // if we decline, then abort
        if( response.decline ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        await this.resolveMoveAwayToken( args, response );
    },


    /**
     * Resolve a move away token
     *
     * @param args
     * @param response
     */
    async resolveMoveAwayToken( args, response ){

        // pay any costs
        this.payCost( response.cost );

        let units = [];

        // handle each individual move
        for( let move of response.moves ){
            move.units.forEach( unitId => units.push( this.game().objectMap[unitId] ) );
            move.hidePrompt = true;

            await this.resolveMove( move )
                .catch( error => console.error( error ) );
        }

        // show our work
        if( response.sound ) this.game().sound( response.sound );

        await this.game().timedPrompt('units-shifted', {
            message : response.promptMessage,
            units: units
        }).catch( error => console.error( error ) );
    }

};

module.exports = obj;
