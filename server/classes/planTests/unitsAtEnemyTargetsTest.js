/**
 * Does this faction have x units (optionally of a specific type) in enemy Target areas?
 *
 * @param debug
 * @param faction
 * @param unitCount
 * @param unitType
 * @returns {boolean}
 */
const test = function unitsAtEnemyTargets( debug, faction, unitCount, unitType = null ){
    let options = {};
    let factionUnitsAtEnemyTargets = 0;
    if( unitType ) options.type = unitType;

    for( let item of Object.values( faction.game().factions ) ) {
        if (item.name === faction.name) continue;
        factionUnitsAtEnemyTargets += faction.unitsInArea( item.targetArea(), options ).length;
    }

    let result = factionUnitsAtEnemyTargets >= unitCount;

    if( debug ) console.log(
        'unitsAtEnemyTargets',
        'unitCount req:', unitCount,
        'unitType req:', unitType,
        'factionUnitsAtEnemyTargets:', factionUnitsAtEnemyTargets,
        'result:', result
    );

    return result;
};

module.exports = test;
