let Card = require( './Card' );

class DesignerPlague extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        let promises = [];
        let units = [];

        //todo select unit type prompt
        let type = await this.chooseUnitType();

        // cycle through each faction and have that player sacrifice units equal to the areas they control
        Object.values( this.game.factions ).forEach( faction => {
            promises.push( this.factionSacrificeUnits( faction, units, type ) );
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
     * Choose a unit type to force each player to sacrifice
     *
     * @returns {Promise<*>}
     */
    async chooseUnitType(){
        let response = await this.faction.prompt( 'choose-basic-unit-type' );
        return response.type;
    }

    /**
     * Force the given faction to sacrifice units equal to the number of areas they control
     *
     * @param faction
     * @param units
     * @param type
     * @returns {Promise<void>}
     */
    factionSacrificeUnits( faction, units, type ){

        // get how many units we need to sacrifice, if we don't have any to sacrifice return
        let areas = this.getSacrificeAreas( faction, type );
        if( !areas.length ) return;


        return this.game.promise({
            players: faction.playerId,
            name: 'sacrifice-units',
            data : {
                count : 1,
                areas : areas,
                type : type
            }})
            .then( async ([player, response]) => await this.resolveFactionSacrificeUnits( player, response, units, faction ) );

    }

    /**
     * Get the areas this faction has units to sacrifice from
     *
     * @param faction
     * @param type
     * @returns {string[]}
     */
    getSacrificeAreas( faction, type ){
        let areas = {};
        let unitsInPlay = faction.data.units.filter( unit => unit.location && !unit.killed && (unit.type === type || unit.additionalTypes?.includes(type) ));

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
            await this.game.killUnit( unit, this.faction );
        }

        // log the results
        let message = `sacrifices <span class="faction-${faction.name}item">${unitNames.join(', ')}</span>`;
        faction.message( message );
    }

}

module.exports = DesignerPlague;
