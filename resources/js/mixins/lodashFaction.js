let helpers = {

    /**
     * Returns the image path for the given faction's icon
     *
     * @param faction
     * @returns {string}
     */
    factionIcon( faction ){
        if( typeof faction !== 'string' ) faction = faction.name;
        return `/images/factions/${faction}/icon.jpg`;
    },


    /**
     * Returns the total money a faction has to spend (resources + energy + dark energy)
     *
     * @param {object} faction
     * @param {boolean} darkEnergy
     * @returns {number}
     */
    money( faction, darkEnergy = false ){
        if( faction.data ) faction = faction.data; // format inputs

        let money = faction.resources + faction.energy;
        if( darkEnergy && faction.hasOwnProperty( 'darkEnergy' ) ) money += faction.darkEnergy;

        return money;
    },


    /**
     * Returns a tally of the number of rule action cards played by a faction
     *    total : the total number of rule cards the faction has played
     *    stack : the greatest number of rule cards the faction has played in a single area
     *    areas : the number of different areas the faction has played rule cards in
     *
     * @param faction
     * @param areas
     * @returns {{total: *, stack: number, areas: number}}
     */
    rulesPlayed( faction, areas ){
        if( faction.data ) faction = faction.data; // format input

        // build results object
        let rules = {
            total : faction.cards.active.length,
            areas : 0,
            stack : 0,
        };

        let globalAreas = {};

        // flag each area where we've played a global card
        for( let card of faction.cards.active ){
            globalAreas[card.playedIn] = globalAreas[card.playedIn] + 1 || 1;
        }

        // cycle through each area
        for( let area of Object.values( areas ) ){
            // grab all the rules we have played
            let areaRules = area.cards.filter( card => card.owner === faction.name );

            if( areaRules.length ) {
                rules.total += areaRules.length; // increment our total rules

                // add these cards to our tally
                if( globalAreas[area.name] ) globalAreas[area.name] += areaRules.length;
                else globalAreas[area.name] = areaRules.length;
            }
        }

        // get the number of different areas where we have played cards
        rules.areas = Object.keys( globalAreas ).length;

        // get the largest number of rule cards played in a single area
        globalAreas = Object.values( globalAreas );
        if( globalAreas.length ){
            rules.stack = globalAreas.reduce( (val, n) => val > n ? val : n );
        }

        return rules;
    }

};



module.exports = helpers;
