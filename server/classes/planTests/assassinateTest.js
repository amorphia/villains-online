/**
 * Does this faction possess at least x enemy markers?
 *
 * @param debug
 * @param faction
 * @param count
 * @returns {boolean}
 */
const test = function assassinate( debug, faction, count ){
    let assassinations = faction.data.hasKilledChampion?.length;
    let result = assassinations >= count;

    if( debug ) console.log(
        'assassinate ---',
        'assassinations req:', count,
        'assassinations:', assassinations,
        'result:', result
    );

    return result;
};

module.exports = test;
