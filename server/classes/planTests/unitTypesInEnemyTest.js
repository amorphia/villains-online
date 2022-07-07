/**
 * Does this faction have x different unit types in enemy areas?
 *
 * @param debug
 * @param faction
 * @param typeCount
 * @returns {boolean}
 */
const test = function unitTypesInEnemy( debug, faction, typeCount ){
    let unitTypesInEnemyCount = Object.keys( _.unitTypesInEnemy( faction.data, faction.game().data.factions, faction.game().data.areas ) ).length;
    let result = unitTypesInEnemyCount >= typeCount;

    if( debug ) console.log (
        'unitTypesInEnemy ---',
        'typeCount req:', typeCount,
        'unitTypesInEnemyCount:', unitTypesInEnemyCount,
        'result:', result
    );

    return result;
};

module.exports = test;
