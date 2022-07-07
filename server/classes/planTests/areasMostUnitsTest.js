/**
 * Does this faction have the most units in x areas?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @returns {boolean}
 */
const test = function areasMostUnits( debug, faction, areaCount ){
    let factionAreasMostUnits = faction.areasMostUnits();
    let result = factionAreasMostUnits >= areaCount;

    if( debug ) console.log(
        'areasMostUnits ---',
        'areaCount req:', areaCount,
        'factionAreasMostUnits:', factionAreasMostUnits,
        'result:', result
    );

    return result;
};

module.exports = test;
