const test = function webbedFaction( debug, faction, webbedCount ){
    let webbedTotals = _.webbedTotals( faction, faction.game().data.factions );
    let result = ! Object.values( webbedTotals.factions ).some( total => total < webbedCount );

    if( debug ) console.log(
        'webbedTotal',
        'webbedCount req:', webbedCount,
        'webbedTotals.factions:', webbedTotals.factions,
        'result:', result
    );

    return result;
};

module.exports = test;
