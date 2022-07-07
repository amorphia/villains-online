/**
 * Did this faction capture x areas from other players this turn?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @returns {boolean}
 */
const test = function areasMostUnits( debug, faction, areaCount ){
    let result = faction.data.areasCapturedThisTurn.length >= areaCount;

    if( debug ) console.log(
        'areasMostUnits ---',
        'areaCount req:', areaCount,
        'factionAreasCaptured:', faction.data.areasCapturedThisTurn.length,
        'result:', result
    );

    return result;
};

module.exports = test;
