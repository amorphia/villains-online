const test = function areasMostUnits( debug, faction, areaCount ){
    let factionAreasMostUnits = faction.areasMostUnits();
    let result = factionAreasMostUnits >= areaCount;

    if( debug ) console.log(
        'areasMostUnits',
        'areaCount req:', areaCount,
        'factionAreasMostUnits:', factionAreasMostUnits,
        'result:', result
    );

    return result;
};

module.exports = test;
