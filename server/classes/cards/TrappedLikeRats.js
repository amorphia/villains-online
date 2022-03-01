let Card = require( './Card' );

class TrappedLikeRats extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){

        let message = 'Choose player to sacrifice a unit';
        // get our target faction
        let targetFaction = await this.faction.selectEnemyPlayerWithUnitsInArea( this.area, message, { allowHidden : true } )
            .catch( error => console.error( error ) );

        // abort if we don't have any targets
        if( !targetFaction ){
            this.game.message( "No players with units in this area", { class : 'warning' } );
            return;
        }

        // get our victim and kill it
        let unit = await this.getSacrificeVictim( targetFaction, this.area );
        await this.game.killUnit( unit, this.faction );

        // show our work
        message = `sacrifices <span class="faction-${unit.faction}">${unit.name}</span> in the ${this.area.name}`;
        this.game.message({ faction: targetFaction, message: message });
        await this.game.timedPrompt('units-shifted', {
            message : `Unit sacrificed to the Trapped Like Rats`,
            units: [unit]
        });

    }


    /**
     * Get the unit that will be sacrificed to basta
     *
     * @param faction
     * @param area
     */
    async getSacrificeVictim( faction, area ) {
        let message = `<span class="faction-${faction.name}">the ${faction.name}</span> must sacrifice a unit`;
        this.game.message({ faction, message });

        // get our enemy units
        let enemyUnits = _.factionUnitsInArea( faction, area.name );

        // if there is only one enemy units just return it
        if ( enemyUnits.length === 1 ) {
            return enemyUnits[0];
        }

        // otherwise let that player choose whch of their units to sacrifice
        let [player, response] = await this.game.promise({
            players: faction.playerId,
            name: 'sacrifice-units',
            data: {count: 1, areas: [area.name]}
        }).catch( error => console.error( error ) );

        return this.game.objectMap[response.units[0]];
    }


}

module.exports = TrappedLikeRats;
