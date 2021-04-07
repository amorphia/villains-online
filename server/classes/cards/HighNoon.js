let Card = require( './Card' );

class HighNoon extends Card {

    /**
     * Resolve this card ability
     */
    async handle() {

        // get our unit types, if we have none, then return
        let unitTypes = this.getReserveUnitTypes();
        if ( !unitTypes.length ) {
            this.faction.message( 'High Noon cannot be resolved (no basic units in your reserves)', { class: 'warning'} );
            return;
        }

        // get our enemies array, if we have none then return
        let enemies = this.getEnemiesWithMatchingUnitsInReserves( unitTypes );
        if( !enemies.length ) {
            this.faction.message( 'High Noon cannot be resolved (no matching basic units in enemy reserves)', { class: 'warning' });
            return;
        }

        // let us choose our units to deploy
        let response = await this.faction.prompt( 'high-noon', {
            area: this.area.name,
            types: unitTypes,
            enemies: enemies
        });

        await this.resolveHighNoonDeploy( response );
    }


    /**
     * Get the unit types in our reserves
     *
     * @returns {string[]}
     */
    getReserveUnitTypes(){
        // get our unit types
        let unitTypes = {};

        this.faction.data.units.forEach( unit => {
            if( !unit.location && unit.basic && !unit.killed ) unitTypes[unit.type] = true;
        });

        return Object.keys( unitTypes );
    }


    /**
     * Return an array of faction names who have units in their reserves that match the basic units in yours
     *
     * @param unitTypes
     * @returns {string[]}
     */
    getEnemiesWithMatchingUnitsInReserves( unitTypes ){
        let enemies = [];

        Object.values( this.game.factions ).forEach( faction => {
            // if this faction is us, or they have hidden reserves then abort
            if ( faction.name === this.faction.name || faction.data.hiddenReserves ) return;

            // if this faction has any matching units add them to our array
            if( faction.data.units.some( unit => this.validReservesUnit( unit, unitTypes ) ) ){
                enemies.push( faction.name )
            }
        });

        return enemies;
    }


    /**
     * Does the given unit match one of our supplied unit types, and is it in reserves?
     *
     * @param unit
     * @param unitTypes
     * @returns {boolean}
     */
    validReservesUnit( unit, unitTypes ){
        return !unit.location && unitTypes.includes( unit.type );
    }


    /**
     * Deploy the units selected for the high noon
     *
     * @param response
     */
    async resolveHighNoonDeploy( response ){
        // get our unit objects
        let units = response.units.map( id => this.game.objectMap[id] );

        // cycle through our units and deploy them
        for( let unit of units ){
            let faction = this.game.factions[ unit.faction ];
            await faction.resolveDeploy( faction.playerId, {
                cost: 0,
                units: [unit.id],
                toArea: this.area.name,
                hidePrompt : true
            }).catch( error => console.error( error ) );
        }

        // display the results
        await this.game.timedPrompt('units-shifted', {
            message: `The ${this.faction.name} place units in the ${this.area.name}`,
            units: units
        }).catch( error => console.error( error ) );
    }

}

module.exports = HighNoon;
