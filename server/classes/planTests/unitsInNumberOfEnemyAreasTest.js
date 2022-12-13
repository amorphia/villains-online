/**
 * Does this faction have x units (optionally of a specific type) in enemy Target areas?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @returns {boolean}
 */
const test = function unitsInNumberOfEnemyAreas( debug, faction, areaCount ){

    let enemyAreasWithUnits = _.enemyAreasWhereFactionHasUnits( faction, faction.game().factions, faction.game().areas );
    let result = enemyAreasWithUnits.length >= areaCount;

    if( debug ) console.log(
        'unitsInNumberOfEnemyAreas ---',
        'areaCount req:', areaCount,
        'enemyAreasWithUnits:', enemyAreasWithUnits,
        'result:', result
    );

    return result;
};

module.exports = test;
