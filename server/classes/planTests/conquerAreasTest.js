/**
 * Has this faction conquered x areas?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @returns {boolean}
 */
const test = function conquerAreas( debug, faction, areaCount ){
    let factionAreasConquered = faction.data.conqueredAreas.length;
    let result = factionAreasConquered >= areaCount;

    if( debug ) console.log(
        'conquerAreas ---',
        'areaCount req:', areaCount,
        'factionAreasConquered:', factionAreasConquered,
        'result:', result
    );

    return result;
};

module.exports = test;
