const test = function unitsAtTarget( debug, faction, unitCount, type = 'talent' ){
    let targetName = faction.targetArea().name;
    let factionUnitsAtTarget = faction.data.units.filter( unit => _.unitInArea( unit, targetName, { type : type } ) ).length;
    let result = factionUnitsAtTarget >= unitCount;

    if( debug ) console.log (
        'unitsAtTarget',
        'unitCount req:', unitCount,
        'type req:', type,
        'factionUnitsAtTarget:', factionUnitsAtTarget,
        'result:', result
    );

    return result;
};

module.exports = test;
