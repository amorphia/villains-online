const test = function enemyUnitsInAreas( debug, faction, unitCount ){
    let factionEnemyUnitsInAreas = faction.enemyUnitsInAreas();
    let result = factionEnemyUnitsInAreas >= unitCount;

    if( debug ) console.log(
        'enemyUnitsInAreas',
        'unitCount req:', unitCount,
        'factionEnemyUnitsInAreas:', factionEnemyUnitsInAreas,
        'result:', result
    );

    return result;
};

module.exports = test;
