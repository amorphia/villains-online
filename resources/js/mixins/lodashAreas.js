let helpers = {

    factionAreasWithDeadUnits( faction ){
        if( faction.data ) faction = faction.data;
        let areas = {};

        faction.units.forEach( unit => {
            if( unit.killed && unit.location ) areas[ unit.location ] = true;
        });

        return Object.keys( areas );
    },

    areasMostUnits( faction, factions ){
        if( faction.data ) faction = faction.data;
        let mostUnits = {};

        // cycle through each faction
        Object.values( factions ).forEach( faction => {
            let unitsInArea = {};

            // make a list of how many units this faction in each area
            faction.units.forEach( unit => {
                if( this.unitInPlay( unit ) ){
                    if( unitsInArea[unit.location] ) unitsInArea[unit.location]++;
                    else unitsInArea[unit.location] = 1;
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





    areasMostTokens( faction, areas ){
        if( faction.data ) faction = faction.data;
        let mostTokens = 0;

        // cycle through each faction
        Object.values( areas ).forEach( area => {
            let tokensInArea = {};

            // make a list of how many units this faction in each area
            area.tokens.forEach( token => {
                if( token.faction ){
                    if( tokensInArea[token.faction] ) tokensInArea[token.faction]++;
                    else tokensInArea[token.faction] = 1;
                }
            });

            // compare this list of units per area to our list of most by area, if this faction has more than
            // the existing entry (if any) it takes the top spot
            if( this.maxSingleObject( tokensInArea ) === faction.name ) mostTokens++;
        });

        return mostTokens;
    },



    factionAreas( faction, areas ){
        let factionAreas = [];

        this.forEach( areas, (area, name) => {
            if( area.owner === faction.name ){
                factionAreas.push( name );
            }
        });
        return factionAreas;
    },


    factionWinningAreas( faction, factions, areas, areaLeaders ){
        let winningAreas = [];
        Object.keys( areas ).forEach( areaName => {
            if( areaLeaders[areaName] && areaLeaders[areaName] === faction.name ) winningAreas.push( areaName );
        });

        if( factions['loyalists']){
            let queen = factions['loyalists'].units.find( unit => this.unitInPlay( unit ) && unit.type === 'champion' );
            if( queen ) winningAreas = winningAreas.filter( area => area !== queen.location );
        }

        return winningAreas;
    },

    determineEnemyAreas( faction, factions, areas, areaLeaders = false ){
        let enemyAreas = [];

        if( areaLeaders ){
            let winningAreas = this.factionWinningAreas( faction, factions, areas, areaLeaders );
            Object.keys( areas ).forEach( areaName => {
                if( !winningAreas.includes( areaName ) ) enemyAreas.push( areaName );
            });
        } else {
            Object.values( areas ).forEach( area => {
                if( area.owner && area.owner !== faction.name ) enemyAreas.push( area.name );
            });
        }

        return enemyAreas;
    },

    areasWithFactionKills( faction, factions ){
        let areas = {};

        this.factionKills( faction, factions ).forEach( kill => {
            areas[kill.location] = true;
        });

        return Object.keys( areas );
    },




    areasWithTokensCount( faction, areas, type ){
        let count = 0;

        _.forEach( areas, area => {
            if( _.find( area.tokens, token => {
                if( token.revealed
                    && token.faction === faction.name
                    && ( !type || token.type === type )
                ) return true;
            }) ) count++;
        });

        return count;
    },

    areasWithUnits( faction, options = {} ){
        if( faction.data ) faction = faction.data;
        if( typeof options.types === 'string' ) options.types = [ options.types ];

        let areas = {};
        faction.units.forEach( unit => {
            if( _.unitInPlay( unit )
                && ( !options.attacks || unit.attack.length )
                && ( !options.types || options.types.includes( unit.type ) )
                && ( !options.adjacent || options.adjacent.includes( unit.location ) )
                && ( !options.flipped || unit.flipped )
                && ( !options.deployable || !unit.noDeploy )
                && ( !options.notHidden || !unit.hidden )
                && ( !options.basic || unit.basic )
                && ( !options.hasProp || unit[options.hasProp] )
            ){
                areas[ unit.location ] = true;
            }
        });

        let areasArray = Object.keys( areas );

        if( options.excludesArea ){
            areasArray = areasArray.filter( area => area !== options.excludesArea );
        }

        return areasArray;
    },

    getCardCounts( faction, area ){
        let cards = {};
        area.cards.forEach( card => {
            if( card.owner === faction.name ){
                cards[card.class] = cards[card.class] ? cards[card.class] + 1 : 1;
            }
        });
        return cards;
    },

    shouldStandDown( faction, area ) {
        return area.cards.some( card => card.class === 'stand-down' );
    },

    areaIsTrapped( faction, area ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        // the aliens can't be trapped
        if( faction.teleports ) return false;

        // if this area is trapped by the plants and we don't have enough money return true
        let vines = area.tokens.filter( token => token.type === 'vines' && token.revealed );
        if( faction.name !== 'plants' && !faction.teleports && vines.length ){
            return _.money( faction ) < vines.length;
        }

        return area.cards.some( card => card.class === 'trapped-like-rats' );
    },


    vinesCost( faction, units, factions ){
        if( faction.name === 'plants' || faction.teleports || ! factions['plants'] ) return 0;

        // find out where each of our vines tokens is located
        let vinesAreas = {};
        let vines = factions['plants'].tokens.forEach( token => {
            if( token.type === 'vines' && token.revealed && token.location ){
                if( vinesAreas[token.location] ) vinesAreas[token.location] = vinesAreas[token.location] + 1;
                else vinesAreas[token.location] = 1;
            }
        });
        if( ! Object.keys( vinesAreas ).length ) return 0;

        // apply appropriate cost per vines token
        let cost = 0;
        units.forEach( unit => {
            if( vinesAreas[ unit.location ] ) cost += vinesAreas[ unit.location ];
        });

        return cost;
    },

    policePayoffs( faction, area, units ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;
        let policePayoff = 0;

        // if our faction teleports, police payoff never applies
        if( faction.teleports ) return policePayoff;

        _.forEach( area.cards, card => {
            if( card.class === 'police-payoff' // if there is a police payoff here
                && card.owner !== faction.name // which we don't own
            ){
                policePayoff++; // increase our police payoff cost by one
            }
        });

        return policePayoff;
    },


    hasKau( faction, area ){
        return faction.kau && faction.kau.location === area.name && !faction.kau.killed;
    },

};



module.exports = helpers;
