/**
 * Has this faction exterminated an enemy target?
 *
 * @param debug
 * @param faction
 * @returns {boolean}
 */
const test = function exterminateEnemyTarget( debug, faction ){
    let result;

    for( let item of Object.values( faction.game().factions ) ){
        if( faction.hasExterminatedArea( item.targetArea() ) ) result = true;
    }

    if( debug ) console.log(
        'exterminateEnemyTarget ---',
        'result:', result
    );

    return result;
};

module.exports = test;
