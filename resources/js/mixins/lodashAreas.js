let helpers = {


    /**
     * Returns a tally of the areas where the given faction has the most units
     *
     * @param faction
     * @param factions
     * @param options
     * @returns {[]}
     */
    areasMostUnits( faction, factions, options = {} ){
        if( faction.data ) faction = faction.data; // format input
        let mostUnits = {};

        // cycle through each faction
        Object.values( factions ).forEach( faction => {
            let unitsInArea = {};

            // make a list of how many units this faction in each area
            faction.units.forEach( unit => {
                if( this.unitInPlay( unit, options ) ){
                    unitsInArea[unit.location] = unitsInArea[unit.location] + 1 || 1;
                }
            });

            // compare this list of units per area to our list of most by area, if this faction has more than
            // the existing entry (if any) it takes the top spot
            for (const [key, value] of Object.entries( unitsInArea ) ) {
                if( !mostUnits[key] || mostUnits[key].count < value ) mostUnits[key] = { faction : faction.name, count : value }
            }
        });

        // convert most units object to array and filter out areas where we don't have the most units
        mostUnits = Object.values( mostUnits ).filter( item => item.faction === faction.name );

        return mostUnits;
    },



    /**
     * Returns an array of area names that this faction controls
     *
     * @param faction
     * @param areas
     * @returns {[]}
     */
    factionAreas( faction, areas ){
        let factionAreas = [];

        this.forEach( areas, (area, name) => {
            if( area.owner === faction.name ) factionAreas.push( name );
        });

        return factionAreas;
    },


    /**
     * Return an array of areas the given faction is currently winning
     *
     * @param faction
     * @param factions
     * @param areas
     * @param areaLeaders
     * @returns {[]}
     */
    factionWinningAreas( faction, factions, areas, areaLeaders ){
        let queen = {}, winningAreas = [];

        // get the queen if the loyalists are in play
        if( factions['loyalists'] ){
            queen = factions['loyalists'].units.find( unit => this.unitInPlay( unit, { type : 'champion' } ) );
        }

        // is this faction the current influence leader in this area?
        Object.keys( areas ).forEach( areaName => {

            // if the queen is in the area the loyalists are winning the area
            if( queen.location === areaName ){
                if( faction.name === 'loyalists' ) winningAreas.push( areaName );
            // otherwise if we have the most influence in the area add this to our winning areas
            } else if( areaLeaders[areaName] && areaLeaders[areaName] === faction.name ) {
                winningAreas.push( areaName );
            }
        });

        return winningAreas;
    },


    /**
     * Determine which areas belong to enemy factions, or are predicted to belong to enemy factions if a predictions
     * object is provided
     *
     * @param faction
     * @param factions
     * @param areas
     * @param predictions
     * @returns {[]}
     */
    determineEnemyAreas( faction, factions, areas, predictions = false ){
        let enemyAreas = [];

        // if we have a set of predictions use those to determine our enemy areas
        if( predictions ){
            let winningAreas = this.factionWinningAreas( faction, factions, areas, predictions );
            return Object.keys( areas ).filter( areaName => !winningAreas.includes( areaName ) );
        }

        // otherwise cycle through each area and push the ones we don't control to our results
        Object.values( areas ).forEach( area => {
            if( area.data ) area = area.data;
            if( area.owner && area.owner !== 'neutral' && area.owner !== faction.name ) enemyAreas.push( area.name );
        });

        return enemyAreas;
    },


    /**
     * Returns the number of areas where a faction has one or more revealed tokens
     *
     * @param faction
     * @param areas
     * @param options
     * @returns {number}
     */
    areasWithTokensCount( faction, areas, options = {} ){
        let count = 0;

        Object.values( areas ).forEach( area => {
            if( area.data ) area = area.data; // format input

            // if the token...
            if( area.tokens.some( token =>
                token.faction === faction.name // .. belongs to the given faction
                && ( options.revealed === false || token.revealed ) // ... and is revealed (or the options allow unrevealed)
                && ( !options.type || token.type === options.type ) ) // ...and the options don't care about type, or we have the proper type
            ){ count++ } // increment the count
        });

        return count;
    },

    areasWithoutUnrevealedTokens( areasData, options = {} ){
        let areas = {};

        Object.values( areasData ).forEach( area => {
            if( area.data ) area = area.data; // format input

            // if the token...
            let unrevealedTokens = area.tokens.filter(token => token.id && !token.revealed);

            if(options.enemy){
                unrevealedTokens = unrevealedTokens.filter(token => token.faction !== options.enemy);
            }

            if( !unrevealedTokens.length ){
                areas[area.name] = true;
            }
        });

        return Object.keys(areas);
    },

    /**
     * Returns an array of area names matching the areas where the given faction has one or more units
     *
     * @param faction
     * @param options
     * @returns {string[]}
     */
    areasWithUnits( faction, options = {} ){
        // format inputs
        if( faction.data ) faction = faction.data;
        if( typeof options.types === 'string' ) options.types = [ options.types ];

        // cycle through units to build our results object
        let results = {};
        faction.units.forEach( unit => {
            // if this unit is in play add this area name to our results
            if( this.unitInPlay( unit, options ) ) results[ unit.location ] = true;
        });

        // convert object to keys array
        results = Object.keys( results );

        // filter excluded area
        if( options.excludesArea ){
            results = results.filter( area => area !== options.excludesArea );
        }

        return results;
    },


    /**
     * Return a tally of the number of each card the given faction has played in the given area
     *
     * @param faction
     * @param area
     * @returns {object} // { cardClassName : {number}, cardClassName : {number}, etc... }
     */
    getFactionCardCountsInArea( faction, area ){
        let results = {};

        // cycle through each card in the area
        area.cards.forEach( card => {
            // if our faction owns the card add it's class name to our tally
            if( card.owner === faction.name ){
                results[card.class] = results[card.class] + 1 || 1;
            }
        });
        return results;
    },


    /**
     * Is this area under the effect of a stand down action card
     *
     * @param faction
     * @param area
     * @returns {boolean}
     */
    areaShouldStandDown( faction, area ) {
        return area.cards.some( card => card.class === 'stand-down' );
    },


    /**
     * Are the given faction's units trapped in the given area?
     *
     * @param faction
     * @param area
     * @returns {boolean}
     */
    areaIsTrapped( faction, area ){
        // format inputs
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        // the aliens can't be trapped
        if( faction.teleports ) return false;

        // if this area is trapped by the plants and we don't have enough money return true
        let vines = area.tokens.filter( token => token.type === 'vines' && token.revealed );
        if( !faction.hasPlants && _.money( faction ) < vines.length ){
            return true;
        }

        // finally is there a trapped like rats played here?
        return area.cards.some( card => card.class === 'trapped-like-rats' );
    },


    /**
     * Calculate the cost levied by vines tokens to move the given units
     *
     * @param faction
     * @param units
     * @param factions
     * @returns {number}
     */
    vinesCost( faction, units, factions ){
        // if we are the plants, the aliens, or there are no vines in the game return 0
        if( faction.hasPlants || faction.teleports || ! factions['plants'] ) return 0;

        // find out where each of the vines tokens is located
        let vinesAreas = {};
        let vines = factions['plants'].tokens // look through the plants tokens
            .filter( token => token.type === 'vines' && token.revealed && token.location ) // find our revealed vines in play
            .forEach( token => vinesAreas[token.location] = vinesAreas[token.location] + 1 || 1 ); // and tally the areas they are in

        // if there are no vines revealed in play, then there are no costs to pay
        if( ! Object.keys( vinesAreas ).length ) return 0;

        // apply appropriate cost per vines token
        let cost = 0;
        units.forEach( unit => {
            if( vinesAreas[ unit.location ] ) cost += vinesAreas[ unit.location ];
        });

        return cost;
    },


    /**
     * Calculate the cost levied by police payoffs to move/deploy units into the given area
     *
     * @param faction
     * @param area
     * @returns {number}
     */
    policePayoffs( faction, area ){
        // format inputs
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        // if our faction teleports, police payoff never applies
        if( faction.teleports ) return 0;

        // return the number of police payoffs played by other players in this area
        return area.cards.filter( card => card.class === 'police-payoff' && card.owner !== faction.name ).length;
    },


    /**
     * Does the given area have Kau in it
     *
     * @param faction
     * @param area
     * @returns {boolean}
     */
    hasKau( faction, area ){
        return faction.kau && faction.kau.location === area.name && !faction.kau.killed;
    },

};



module.exports = helpers;
