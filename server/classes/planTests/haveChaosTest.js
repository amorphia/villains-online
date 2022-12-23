/**
 * Has this faction killed x units without attacking with their units this turn?
 *
 * @param debug
 * @param faction
 * @param level
 * @returns {boolean}
 */
const test = function haveChaos( debug, faction, level ) {
    let levelChaos = faction.data.chaosLevels[level];
    let currentChaos = faction.data.chaos;
    let result = currentChaos >= levelChaos;

    if( debug ) console.log(
        'haveChaos ---',
        'level req:', level,
        'levelChaos:', levelChaos,
        'currentChaos:', currentChaos,
        'result:', result
    );

    return result;
}

module.exports = test;
