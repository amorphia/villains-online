/**
 * Has this faction killed units in x different areas?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @returns {boolean}
 */
const test = function killsInAreas( debug, faction, areaCount ){
    let factionAreasWithKills = faction.areasWithKills().length;
    let result = factionAreasWithKills >= areaCount;

    if( debug ) console.log(
        'killsInAreas',
        'areaCount req:', areaCount,
        'factionAreasWithKills:', factionAreasWithKills,
        'result:', result
    );

    return result;
};

module.exports = test;
