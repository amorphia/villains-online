/**
 * Does this faction have units in x different areas?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @returns {boolean}
 */
const test = function unitsInAreas( debug, faction, areaCount ){
    let factionAreasWithUnits = faction.areasWithUnits().length;
    let result =  factionAreasWithUnits >= areaCount;

    if( debug ) console.log(
        'unitsInAreas',
        'areaCount req:', areaCount,
        'factionAreasWithUnits:', factionAreasWithUnits,
        'result:', result
    );

    return result;
};

module.exports = test;
