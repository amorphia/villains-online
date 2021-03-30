const test = function skilledAtTarget( debug, faction, unitCount ){
    let targetName = faction.targetArea().name;
    let factionUnitsAtTarget = faction.data.units.filter( unit => _.unitInArea( unit, targetName, { skilled : true } ) ).length;
    let result = factionUnitsAtTarget >= unitCount;

    if( debug ) console.log (
        'skilledAtTarget',
        'unitCount req:', unitCount,
        'factionUnitsAtTarget:', factionUnitsAtTarget,
        'result:', result
    );

    return result;
};

module.exports = test;
