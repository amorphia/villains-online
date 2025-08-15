/**
 * Has this faction conquered x areas?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @returns {boolean}
 */
const test = function conquerEveryArea( debug, faction ){
    let factionAreasConquered = faction.data.conqueredAreas.length;
    let areaCount = faction.game().data.playerOrder.length === 3 ? 7 : 9; // we need all areas, so 7 in 3player game 9 otherwise
    let result = factionAreasConquered >= areaCount;

    if( debug ) console.log(
        'conquerEveryArea ---',
        'areaCount req:', areaCount,
        'factionAreasConquered:', factionAreasConquered,
        'result:', result
    );

    return result;
};

module.exports = test;
