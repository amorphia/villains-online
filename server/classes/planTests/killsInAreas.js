const test = function killsInAreas( debug, faction, areaCount ){
    let factionAreasWithKills = faction.areasWithKills().length;
    let result = factionAreasWithKills >= areaCount;

    if( debug ) console.log(
        'killsInAreas',
        'areaCount req:', areaCount,
        'factionAreasWithKills:', factionAreasWithKills,
        'result:', result
    );

    return result;
};

module.exports = test;
