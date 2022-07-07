/**
 * has this faction exterminate their target?
 *
 * @param debug
 * @param faction
 * @returns {*}
 */
const test = function exterminateTarget( debug, faction ){
    let targetArea = faction.targetArea();
    let result = faction.hasExterminatedArea( targetArea );

    if( debug ) console.log(
        'exterminateTarget ---',
        'targetArea:', targetArea.name,
        'result:', result
    );

    return result;
};

module.exports = test;
