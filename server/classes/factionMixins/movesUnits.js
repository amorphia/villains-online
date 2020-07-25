let obj = {

    canActivateMove( token, area ){
        return this.money() >= 2 && this.moveFromAreas( { area:area } ).length > 0;
    },


    async moveToken( args ) {
        args.fromToken = true;
        let output = await this.move( args );

        if( output.declined ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.game().advancePlayer()
    },


    async move( args ){

        let fromAreas = this.moveFromAreas( args );
        if( !fromAreas.length ){
            this.message({ message: 'No valid moves', class : 'warning' });
            return;
        }

        let data = {
            toArea : args.area.name,
            fromAreas : fromAreas,
            fromToken : args.fromToken,
            moveLimit : args.moveLimit
        };

        let result = await this.game().promise({ players: args.player, name: 'move-action', data : data });
        return await this.processMove( ...result );
    },


    moveFromAreas( args = {} ){
        let areas;

        // if our move isn't limited to adjacency return every area but this one
        if( args.farMove || this.data.farMove || this.areas().includes( 'subway' ) ){
            areas = this.game().data.areaOrder.slice();
            areas = areas.filter( area => area !== args.area.name );
        } else {
            areas = args.area.data.adjacent.slice();
        }

        areas = areas.filter( area => {
            let hasUnits = !! _.find( this.data.units, unit => _.unitInArea( unit, area ) );
            let isTrapped = this.game().areas[area].data.cards.filter( card => card.class === 'trapped-like-rats' ).length && ! _.hasKauImmunity( this.data, area );
            return hasUnits && ! isTrapped;
        });

        return areas;
    },

    async processMove( player, data ){
        if( data.decline ) return { declined : true };

        let output = {
            cost : data.cost,
            units : [],
        };

        this.payCost( data.cost );

        data.units.forEach( unitId => {
            let unit = this.game().objectMap[unitId];

            output.units.push({
                from : unit.location,
                unit : unit
            });

            // update area
            unit.location = data.toArea;

            // un-ready units
            if( unit.ready ) unit.ready = false;
        });

        let unitNames = [];
        output.units.forEach( data => unitNames.push( data.unit.name ) );

        let message = ` <span class="faction-${this.name}">${ unitNames.join(', ') }</span> to the ${output.units[0].unit.location}`;

        if( data.cost ){
            message = `Pay xC${output.cost}x to move` + message;
        } else {
            message = 'Moves' + message;
        }

        this.message({ message: message, faction : this });
        await this.triggeredEvents( 'move', output.units );

        return output;
    },

    async moveAwayToken( args, options ){
        let data, player;

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'move-away',
            data: options
        });

        if( data.decline ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.payCost( data.cost );

        for( let move of data.moves ){
            await this.processMove( player, move );
        }
    }

};

module.exports = obj;
