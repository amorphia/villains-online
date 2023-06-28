/**
 * Does this faction have x skilled units at their target?
 *
 * @param debug
 * @param faction
 * @param unitCount
 * @returns {boolean}
 */
const test = function skilledAtTarget( debug, faction, unitCount ){
    let targetName = faction.targetName();
    let factionUnitsAtTarget = faction.data.units.filter( unit => _.unitInArea( unit, targetName, { skilled : true } ) ).length;
    let result = factionUnitsAtTarget >= unitCount;

    if( debug ) console.log (
        'skilledAtTarget ---',
        'unitCount req:', unitCount,
        'factionUnitsAtTarget:', factionUnitsAtTarget,
        'result:', result
    );

    return result;
};

module.exports = test;
