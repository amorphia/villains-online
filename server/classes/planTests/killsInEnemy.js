const test = function killsInEnemy( debug, faction, killCount ){
    let factionKillsInEnemy = faction.killsInEnemy().length;
    let result = factionKillsInEnemy >= killCount;

    if( debug ) console.log(
        'killsInEnemy',
        'killCount req:', killCount,
        'factionKillsInEnemy:', factionKillsInEnemy,
        'result:', result
    );

    return result;
};

module.exports = test;
