/**
 * Does this faction control their target?
 *
 * @param debug
 * @param faction
 * @returns {boolean}
 */
const test = function controlOwnTarget( debug, faction ) {
    let areasControlled = faction.areas();
    let result = areasControlled.includes(faction.targetName());

    if( debug ) console.log(
        'controlOwnTarget ---',
        'areasControlled:', areasControlled,
        'result:', result
    );

    return result;
};

module.exports = test;
