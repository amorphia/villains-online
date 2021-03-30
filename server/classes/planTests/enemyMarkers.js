const test = function enemyMarkers( debug, faction, enemyMarkers ){
    let factionEnemyMarkers = faction.data.captured.current;
    let result = faction.data.captured.current >= enemyMarkers;

    if( debug ) console.log(
        'enemyMarkers',
        'enemyMarkers req:', enemyMarkers,
        'factionEnemyMarkers:', factionEnemyMarkers,
        'result:', result
    );

    return result;
};

module.exports = test;
