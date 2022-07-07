/**
 * Has this faction killed units belonging to x different players?
 *
 * @param debug
 * @param faction
 * @param killCount,
 * @param playerCount
 * @returns {boolean}
 */
const test = function killsByPlayer( debug, faction, killCount, playerCount ){
    let kills = faction.enemiesWithMinKills( killCount );
    let result = kills >= playerCount;

    if( debug ) console.log(
        'killsInAreas ---',
        'killCount req:', killCount,
        'playerCount req:', playerCount,
        'factionWithMinKills:', kills,
        'result:', result
    );

    return result;
};

module.exports = test;
