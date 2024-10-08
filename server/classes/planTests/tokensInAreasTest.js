/**
 * Does this faction have tokens in x different areas?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @param type
 * @returns {boolean}
 */
const test = function tokensInAreas( debug, faction, areaCount, type ) {
    let factionCount = _.areasWithTokensCount( faction, faction.game().data.areas, { type : type } );

    let result = factionCount >= areaCount;

    if( debug ) console.log(
        'tokensInAreas ---',
        'areaCount req:', areaCount,
        'type req:', type,
        'factionCount:', factionCount,
        'result:', result
    );

    return result;
};

module.exports = test;
