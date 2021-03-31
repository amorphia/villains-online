/**
 * Does this faction control their target?
 *
 * @param debug
 * @param faction
 * @returns {boolean}
 */
const test = function controlTarget( debug, faction ) {
    let targetController = faction.targetArea().data.owner;
    let result = faction.targetArea().data.owner === faction.name;

    if( debug ) console.log(
        'controlTarget',
        'targetController:', targetController,
        'result:', result
    );

    return result;
};

module.exports = test;
