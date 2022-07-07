/**
 * Does this faction have x or more units of a given type at their target?
 *
 * @param debug
 * @param faction
 * @param unitCount
 * @param type
 * @returns {boolean}
 */
const test = function unitsAtTarget( debug, faction, unitCount, type = 'talent' ){
    let targetName = faction.targetArea().name;
    let factionUnitsAtTarget = faction.data.units.filter( unit => _.unitInArea( unit, targetName, { type : type } ) ).length;
    let result = factionUnitsAtTarget >= unitCount;

    if( debug ) console.log (
        'unitsAtTarget ---',
        'unitCount req:', unitCount,
        'type req:', type,
        'factionUnitsAtTarget:', factionUnitsAtTarget,
        'result:', result
    );

    return result;
};

module.exports = test;
