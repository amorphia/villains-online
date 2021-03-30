const test = function areasMostTokens( debug, faction, areaCount ){
    let factionAreasMostTokens = faction.areasMostTokens();
    let result = factionAreasMostTokens >= areaCount;

    if( debug ) console.log(
        'areasMostTokens',
        'areaCount req:', areaCount,
        'factionAreasMostTokens:', factionAreasMostTokens,
        'result:', result
    );

    return result;
};

module.exports = test;
