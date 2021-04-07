let Card = require( './Card' );

class LetGodSortThemOut extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        let promises = [];
        let units = [];

        // cycle through each faction and have that player sacrifice units equal to the areas they control
        Object.values( this.game.factions ).forEach( faction => {
            promises.push( this.factionSacrificeUnits( faction, units ) );
        });

        await Promise.all( promises );

        // display the results
        if( units.length ){
            await this.game.timedPrompt('units-shifted', {
                message: `The ${this.faction.name} killed the following units`,
                units: units
            });
        }
    }


    /**
     * Force the given faction to sacrifice units equal to the number of areas they control
     *
     * @param faction
     * @param units
     * @returns {Promise<void>}
     */
    factionSacrificeUnits( faction, units ){

        // get how many units we need to sacrifice, if we don't have any to sacrifice return
        let unitsToSacrifice = this.getUnitsToSacrificeCount( faction );
        if( !unitsToSacrifice ) return;

        let areas = this.getSacrificeAreas( faction );

        return this.game.promise({
            players: faction.playerId,
            name: 'sacrifice-units',
            data : {
                count : unitsToSacrifice,
                areas : areas
            }})
            .then( async ([player, response]) => await this.resolveFactionSacrificeUnits( player, response, units, faction ) );

    }


    /**
     * Return a count of how many units this faction must sacrifice
     *
     * @param faction
     * @returns {number}
     */
    getUnitsToSacrificeCount( faction ){
        let areasOwned = faction.areas().length;
        let unitsInPlay = faction.data.units.filter( unit => unit.location && !unit.killed );
        return Math.min( areasOwned, unitsInPlay.length );
    }


    /**
     * Get the areas this faction has units to sacrifice from
     *
     * @param faction
     * @returns {string[]}
     */
    getSacrificeAreas( faction ){
        let areas = {};
        let unitsInPlay = faction.data.units.filter( unit => unit.location && !unit.killed );

        unitsInPlay.forEach( unit => areas[unit.location] = true );
        return Object.keys( areas );
    }


    /**
     * Resolve a factions's sacrifices
     *
     * @param player
     * @param response
     * @param units
     * @param faction
     */
    async resolveFactionSacrificeUnits( player, response, units, faction ){
        // clear our prompt
        player.setPrompt({ active : false, updatePlayerData : true });

        let unitNames = [];
        // cycle through our units
        for( let unitId of response.units ){
            // get the unit object
            let unit = this.game.objectMap[unitId];
            // add its name to our names array
            unitNames.push( unit.name );
            // add it to our units results array
            units.push( unit );
            // kill this unit
            await this.game.killUnit( unit, faction );
        }

        // log the results
        let message = `sacrifices <span class="faction-${item.name}item">${unitNames.join(', ')}</span>`;
        faction.message( message );
    }

}

module.exports = LetGodSortThemOut;
