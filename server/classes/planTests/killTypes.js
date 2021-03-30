const test = function killTypes( debug, faction, types, killCount ){
    let typesKilled = faction.unitTypesKilled();
    let killsOfTypes = 0;

    types.forEach( type => {
        if( typesKilled.hasOwnProperty( type ) ) killsOfTypes += typesKilled[type];
    });

    let result = killsOfTypes >= killCount;

    if( debug ) console.log(
        'killTypeCount',
        'types req:', types,
        'killCount req:', killCount,
        'typesKilled:', typesKilled,
        'result:', result
    );

    return result;
};

module.exports = test;
