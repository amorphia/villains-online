/**
 * Has this faction played x rule cards [total, in a single area, or in different areas]
 *
 * @param debug
 * @param faction
 * @param count
 * @param mode
 * @returns {boolean}
 */
const test = function playRules( debug, faction, count, mode = 'total' ){
    let result;
    let rulesPlayed = faction.rulesPlayed();

    switch( mode ){
        case 'total':
            result = rulesPlayed.total >= count;
            break;
        case 'areas':
            result = rulesPlayed.areas >= count;
            break;
        case 'stack':
            result = rulesPlayed.stack >= count;
            break;
    }

    if( debug ) console.log(
        'playRules ---',
        'count req:', count,
        'rulesPlayed:', rulesPlayed,
        'result:', result
    );

    return result;
};

module.exports = test;
