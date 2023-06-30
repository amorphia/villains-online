let obj = {

    /**
     * Replace an enemy unit with a matching unit
     * @param options
     */
    async replaceUnit( options = {} ){
        let result;

        do {
            result = await this.getUnits( options );
        } while ( result.response === 'goBack' );

        console.log( 'replaceUnit', result );

        if( result.response === 'declined' ){
            this.game().message({ class : 'warning', message : 'Declines to replace a unit' });
            return false;
        }

        if( result.response === 'failed' ){
            this.game().message({ class : 'warning', message : 'Unable to replace a unit' });
            return false;
        }

        await this.resolveUnitReplacement( result.enemyUnit, result.ourUnit, options );

        return result.ourUnit;
    },

    async getUnits( options ) {
        const { enemyUnit, enemyResult } = await this.getUnitToReplace( options );

        if ( enemyResult !== 'success' ) {
            return { response: enemyResult };
        }

        const { ourUnit, ourResult } = await this.getReplacementUnit( enemyUnit, options )

        if ( ourResult !== 'success' ) {
            return { response: ourResult };
        }

       return { enemyUnit, ourUnit, response: "success" };
    },

    async getUnitToReplace( options ){
        // get list of units types we can replace
        let unitTypes = this.getValidReplacementTypes( options );

        if( !unitTypes.length ){
            return { enemyResult: "failed" };
        }

        // prompt player to choose a replacement from among valid options
        let response = await this.prompt( 'choose-units', {
            count : 1,
            areas : [options.area.name],
            basicOnly: true,
            unitTypes: unitTypes,
            enemyOnly : true,
            payCost: true,
            canDecline : true,
            canBeReplaced: true,
            message: "Choose a unit to replace"
        });

        if( response.decline ){
            return { enemyResult: "declined" };
        }

        let enemyUnit = this.game().objectMap[ response.units[0] ];
        return { enemyUnit , enemyResult: "success" };
    },

    getValidReplacementTypes( options ){
        let optionsTypes = options.types ?? [ 'patsy', 'goon', 'mole', 'talent' ];

        // the types our opponents have in this area
        let enemyTypes = this.enemyUnitTypesInArea( options.area, { basic : true, canBeReplaced: true } );

        let validTypes = _.intersection( optionsTypes, enemyTypes );

        // the types we have in our reserves
        let reservesTypes = this.unitTypesInReserves( true );

        // types we have in play
        let playTypes = this.getReplaceableTypesInPlay( validTypes );

        // combine our types and the valid types to produce a master list of potential types
        let ourTypes = new Set([ ...reservesTypes, ...playTypes ]);
        ourTypes = [ ...ourTypes ];

        // whatever types are on both arrays are hypnotizable
        return _.intersection( ourTypes, validTypes );
    },

    getReplaceableTypesInPlay( validTypes ){
        let types = new Set();

        let trappedAreas = this.game().trappedAreas();

        this.data.units.forEach( unit => {
            if( this.canThisUnitBeAReplacement( unit, validTypes, trappedAreas ) ){
                types.add( unit.type );
            }
        });

        return [ ...types ];
    },

    canThisUnitBeAReplacement( unit, validTypes, trappedAreas ){
        // a unit can't be re-deployed if it isn't already in a play, duh
        if( !_.unitInPlay( unit ) ) return false;

        // a webbed unit is stuck
        if( unit.webbed ) return false;

        // if our deploy is limited to a certain unit type only include areas with those
        if( validTypes.includes( unit.type ) ) return false;

        // if we made it this far, then yes! We can redeploy this unit
        return true;
    },

    /**
     * Find a replacement unit from our reserves
     *
     * @returns {Unit}
     */
    async getReplacementUnit( enemyUnit, options ){
        let trappedAreas = this.game().trappedAreas();

        // use the enemy unit to determine type we can place
        let areasWithType = this.areasWithUnits({ type: enemyUnit.type, notWebbed: true })
            .filter( areaName  => !trappedAreas.includes( areaName ) );

        // prompt player for global place
        let response = await this.prompt('global-place', {
            count : 1,
            area : options.area.name,
            fromAreas: areasWithType,
            unitTypes: [ enemyUnit.type ],
            canGoBack: true,
            message: `Choose your replacement for the ${enemyUnit.type} in the ${options.area.name}`,
        });

        if( response.decline ){
            return { ourResult: "declined" };
        }

        if( response.goBack ){
            return { ourResult: "goBack" };
        }

        let ourUnit = this.game().objectMap[ response.units[0] ];
        return { ourUnit , ourResult: "success" };
    },


    /**
     * Resolve the replacement of an enemy unit with one of our own
     *
     * @param original
     * @param replacement
     * @param options
     */
    async resolveUnitReplacement( original, replacement, options ){
        const units = [];

        // pay costs
        if( original.cost > 0 ) this.payCost( original.cost, true );

        // replace unit
        await this.placeUnit( replacement, original.location, { unflip: true } );

        // prepare data for popup prompt
        units.push( replacement );
        units.push( _.clone( original ) );

        // return original to owner
        let owner = this.game().factions[original.faction];
        owner.returnUnitToReserves( original );

        // show our work
        if( options.silent ){
            return;
        }

        let message = `Replaces <span class="faction-${original.faction}">The ${original.faction} ${original.name}</span> in the ${options.area.name}`;
        this.message( message );

        if( options.sound ){
            this.game().sound( options.sound );
        }

        await this.game().timedPrompt('units-shifted', {
            message: options.message ?? message,
            units: units.reverse()
        });
    }

};

module.exports = obj;
