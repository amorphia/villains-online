let Card = require( './Card' );

class AllHollowsEve extends Card {

    reviveCount = 4;

    /**
     * Resolve this card ability
     */
    async handle(){

        // get our potential areas, and if we have none abort
        let areas = this.getAreasWithKilledUnits();
        if( !areas.length ){
            this.faction.message( 'No killed units to revive', { class : 'warning' } );
            return;
        }

        // let player choose their next unit
        let response = await this.faction.prompt( 'choose-units', {
            count : this.reviveCount,
            optionalMax: true,
            areas : areas,
            playerOnly : true,
            killedOnly : true,
            message: `Choose up to ${this.reviveCount} units killed to revive`,
        });

        // no unit selected? Welp, guess we are done here
        if( !response.units ){
            this.faction.message( 'Declines to revive any units', { class : 'warning' } );
            return;
        }

        // revive our units
        await this.resolveUnitRevival( response );
    }


    /**
     * Return an array of area names where we have killed units
     *
     * @returns {string[]}
     */
    getAreasWithKilledUnits(){
        let areas = {};

        // get areas where we have killed units
        this.faction.data.units.forEach( unit => {
            if( unit.killed && unit.location ){
                areas[unit.location] = true;
            }
        });

        return Object.keys( areas );
    }


    async resolveUnitRevival( response ){
        // get our unit objects
        let units = response.units.map( unitId => this.game.objectMap[unitId] );

        // revive our units
        units.forEach( unit => {
            unit.killed = false;
            if( unit.ready ) unit.ready = false;
            if( unit.flipped ) this.faction.unflipUnit( unit );
        });

        // display the results
        await this.game.timedPrompt('units-shifted', {
            message: `The ${this.faction.name} returns killed units to play`,
            units: units
        }).catch( error => console.error( error ) );
    }
}

module.exports = AllHollowsEve;
