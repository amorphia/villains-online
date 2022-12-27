let obj = {

    /**
     * Resolve this card ability
     */
    async reviveUnits( args ){
        // get our potential areas, and if we have none abort
        let areas = this.getValidAreas( args );

        if( !areas.length ){
            this.message( 'No killed units to revive', { class : 'warning' } );
            return;
        }

        // let player choose their next unit
        let response = await this.prompt( 'choose-units', {
            count : args.reviveCount,
            optionalMax: true,
            areas : areas,
            playerOnly : true,
            killedOnly : true,
            basicOnly : args.basicOnly,
            message: `Choose up to ${args.reviveCount} units killed to revive`,
        });

        // no unit selected? Welp, guess we are done here
        if( !response.units ){
            this.message( 'Declines to revive any units', { class : 'warning' } );
            return;
        }

        // revive our units
        return await this.resolveUnitRevival( response, args );
    },


    getValidAreas( args ){
        if( args.areas ){
            return args.areas;
        }

        return this.getAreasWithKilledUnits( args );
    },


    /**
     * Return an array of area names where we have killed units
     *
     * @returns {string[]}
     */
    getAreasWithKilledUnits( args ){
        let areas = {};

        // get areas where we have killed units
        this.data.units.forEach( unit => {
            if( unit.killed && unit.location && (!args.basicOnly || unit.basic) ){
                areas[unit.location] = true;
            }
        });

        return Object.keys( areas );
    },


    async resolveUnitRevival( response, args ){
        // get our unit objects
        let units = response.units.map( unitId => this.game().objectMap[unitId] );

        // revive our units
        units.forEach( unit => {
            unit.killed = false;
            if( unit.ready ) unit.ready = false;
            if( unit.flipped ) this.faction.unflipUnit( unit );
        });

        if( args.reviveEvent && typeof this[args.reviveEvent] === 'function' ){
            units = this[args.reviveEvent]( units, args );
        }

        // display the results
        await this.game().timedPrompt('units-shifted', {
            message: `The ${this.name} returns killed units to play`,
            units: units
        }).catch( error => console.error( error ) );
    }

};

module.exports = obj;
