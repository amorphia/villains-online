/**
 * Does this faction have at least x enemy units in areas they control?
 *
 * @param debug
 * @param faction
 * @param unitCount
 * @returns {boolean}
 */
const test = function enemyUnitsInAreas( debug, faction, unitCount ){
    let factionEnemyUnitsInAreas = faction.enemyUnitsInOurAreasCount();
    let result = factionEnemyUnitsInAreas >= unitCount;

    if( debug ) console.log(
        'enemyUnitsInAreas ---',
        'unitCount req:', unitCount,
        'factionEnemyUnitsInAreas:', factionEnemyUnitsInAreas,
        'result:', result
    );

    return result;
};

module.exports = test;
