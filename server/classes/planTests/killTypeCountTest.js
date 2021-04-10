/**
 * Has this faction killed units of x different types?
 *
 * @param debug
 * @param faction
 * @param typeCount
 * @returns {boolean}
 */
const test = function killTypeCount( debug, faction, typeCount ){
    let typesKilled = faction.unitTypesKilled();
    let result = Object.keys( typesKilled ).length >= typeCount;

    if( debug ) console.log(
        'killTypeCount',
        'typeCount req:', typeCount,
        'typesKilled:', typesKilled,
        'result:', result
    );

    return result;
};

module.exports = test;
