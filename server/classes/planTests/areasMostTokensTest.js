/**
 * Does this faction have the most tokens in x areas?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @returns {boolean}
 */
const test = function areasMostTokens( debug, faction, areaCount ){
    let factionAreasMostTokens = faction.areasWithMostTokens();
    let result = factionAreasMostTokens >= areaCount;

    if( debug ) console.log(
        'areasMostTokens',
        'areaCount req:', areaCount,
        'factionAreasMostTokens:', factionAreasMostTokens,
        'result:', result
    );

    return result;
};

module.exports = test;
