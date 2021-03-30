const test = function exterminateAreas( debug, faction, exterminateCount = 1, targetOnly = false ){
    let factionExterminatedAreas = faction.areasExterminated( targetOnly ).length;
    let result = factionExterminatedAreas >= exterminateCount;

    if( debug ) console.log (
        'exterminateAreas',
        'exterminateCount req:', exterminateCount,
        'factionExterminatedAreas:', factionExterminatedAreas,
        'result:', result
    );

    return result;
};

module.exports = test;
