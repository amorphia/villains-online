/**
 * Has this faction trapped at least x total units in webs?
 *
 * @param debug
 * @param faction
 * @param webbedCount
 * @returns {boolean}
 */
const test = function webbedTotal( debug, faction, webbedCount ){

    let webbedTotals = _.webbedTotals( faction, faction.game().data.factions );
    let result = webbedTotals.total >= webbedCount;

    if( debug ) console.log(
        'webbedTotal ---',
        'webbedCount req:', webbedCount,
        'webbedTotals.total:', webbedTotals.total,
        'result:', result
    );

    return result;
};

module.exports = test;
