/**
 * Has the given faction trapped x or more units belonging to each enemy player?
 *
 * @param debug
 * @param faction
 * @param webbedByFactionCount
 * @returns {boolean}
 */
const test = function webbedFaction( debug, faction, webbedByFactionCount ){
    let webbedTotals = _.webbedTotals( faction, faction.game().data.factions );
    let result = ! Object.values( webbedTotals.factions ).some( total => total < webbedByFactionCount );

    if( debug ) console.log(
        'webbedTotal',
        'webbedCount req:', webbedByFactionCount,
        'webbedTotals.factions:', webbedTotals.factions,
        'result:', result
    );

    return result;
};

module.exports = test;
