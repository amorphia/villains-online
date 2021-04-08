let helpers = {

    /**
     * Returns the number of kills the given faction has in the given area
     *
     * @param factionName
     * @param areaName
     * @param factions
     * @returns {number}
     */
    killsInArea( factionName, areaName, factions ){
        // format inputs
        if( typeof factionName !== 'string' ) factionName = factionName.name;
        if( typeof areaName !== 'string' ) areaName = areaName.name;

        let results = 0;

        // cycle through each faction counting our kills
        Object.values( factions ).forEach( faction => {
            if( faction.data ) faction = faction.data; //format input

            // ignore our units
            if( faction.name === factionName ) return;

            // add our killed to our results
            results += faction.units.filter( unit => this.factionKilledUnitHere( factionName, unit, areaName ) ).length;
        });

        return results;
    },


    /**
     * Has the given faction killed the given unit in the given area?
     *
     * @param faction
     * @param unit
     * @param area
     * @returns {boolean}
     */
    factionKilledUnitHere( faction, unit, area ){
        //format inputs
        if( typeof faction !== 'string' ) faction = faction.name;
        if( typeof area !== 'string' ) area = area.name;

        return unit.killed === faction && unit.location === area;
    },


    /**
     * Returns the faction name of the faction that has exterminated the given area,
     * or false if this area has not been exterminated
     *
     * @param area
     * @param factions
     * @returns {string|boolean} // faction name or false
     */
    areaExterminated( area, factions ){
        if( area.data ) area = area.data; // format input

        // if the area has been nuked, return the name of the faction that played the nuke
        let suitcaseNuke = _.find( area.cards, card => card.class === 'suitcase-nuke' );
        if( suitcaseNuke ) return suitcaseNuke.owner;

        let factionsWithUnitsHere = [];
        let factionsWithNonHiddenUnitsHere = [];

        Object.values( factions ).forEach( faction => {
            if( faction.data ) faction = faction.data; // format input

            // get all of the factions with units in this area
            if( faction.units.some( unit => this.unitInArea( unit, area ) ) ) factionsWithUnitsHere.push( faction.name );

            // get all of the factions with non-hidden units in this area
            if( faction.units.some( unit => this.unitInArea( unit, area, { notHidden: true } ) ) ) factionsWithNonHiddenUnitsHere.push( faction.name );
        });


        // if only one player has units here (including hidden units), and that player has a kill they have scored an exterminate
        if( factionsWithUnitsHere.length === 1 && this.killsInArea( factionsWithUnitsHere[0], area.name, factions ) > 0 ){
            return factionsWithUnitsHere[0];
        }

        // if multiple players have units here, but only one has non-hidden units and they have a kill, that player has scored an exterminate
        if( factionsWithNonHiddenUnitsHere.length === 1 && this.killsInArea( factionsWithNonHiddenUnitsHere[0], area.name, factions ) > 0 ){
            return factionsWithNonHiddenUnitsHere[0];
        }

        return false;
    },



    /**
     * Returns an object that tallies the number of each unit type killed by the given player, or
     * false if that player has killed no units
     *
     * @param faction
     * @param factions
     * @returns {boolean}
     */
    factionTypesKilled( faction, factions ){
        let types = {};

        let kills = this.factionKills( faction, factions );
        kills.forEach( unit => {
            if( types.hasOwnProperty( unit.type ) ) types[unit.type]++;
            else types[unit.type] = 1;
        });

        return Object.keys( types ).length ? types : false;
    },


    /**
     * Returns all of the killed units in the given area organized by the killing faction
     *
     * @param areaName
     * @param factions
     * @returns {object} // { factionName : [Units], factionsName: [Units], etc... }
     */
    allKilledUnitsInAreaByFaction( areaName, factions ){
        if( typeof areaName !== 'string' ) areaName = areaName.name; // format input

        let results = {};

        Object.values( factions ).forEach( faction => {
            if( faction.data ) faction = faction.data; // format input

            faction.units.forEach( unit => {
                if( unit.location === areaName && unit.killed ){
                    if( results.hasOwnProperty( unit.killed ) ){
                        results[unit.killed].push( unit );
                    } else {
                        results[unit.killed] = [unit];
                    }
                }
            });
        });

        return results;
    },


    /**
     * Returns all of the units killed by a given faction
     *
     * @param killingFaction
     * @param factions
     * @returns {[]}
     */
    factionKills( killingFaction, factions ){
        let results = [];

        // cycle through each faction
        Object.values( factions ).forEach( faction => {
            if( faction.data ) faction = faction.data; //format inputs
            if( faction.name === killingFaction.name ) return; // only count enemy factions

            // cycle through each of that faction's units
            faction.units.forEach( unit => {
                // if that unit has been killed by our killingFaction add it to our results
                if( unit.killed === killingFaction.name ) results.push( unit );
            })
        });

        return results;
    },


    /**
     * Returns all of the units killed by a given faction in enemy owned areas, if a set of predictions are provided
     * instead use those predictions to calculate which areas are predicted to be enemy owned at the end of the turn
     *
     * @param faction
     * @param factions
     * @param areas
     * @param predictions
     * @returns {Unit[]}
     */
    factionKillsInEnemy( faction, factions, areas, predictions = false ){
        let enemyAreas = this.determineEnemyAreas( faction, factions, areas, predictions );

        return this.factionKills( faction, factions ).filter( unit => enemyAreas.includes( unit.location ) );
    },



};



module.exports = helpers;
