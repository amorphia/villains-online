/**
 * Does this faction control x areas?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @returns {boolean}
 */
const test = function controlAreas( debug, faction, areaCount ){
    let factionAreasControlled = faction.areas().length;
    let result = factionAreasControlled >= areaCount;

    if( debug ) console.log(
        'controlAreas ---',
        'areaCount req:', areaCount,
        'factionAreasControlled:', factionAreasControlled,
        'result:', result
    );

    return result;
};

module.exports = test;
