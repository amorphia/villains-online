/**
 * Does this faction have x units in play?
 *
 * @param debug
 * @param faction
 * @param unitsInPlay
 * @returns {boolean}
 */
const test = function unitsInPlay( debug, faction, unitsInPlay ){
    let factionUnitsInPlay = faction.unitsInPlay().length;
    let result = factionUnitsInPlay >= unitsInPlay;

    if( debug ) console.log(
        'unitsInPlay',
        'unitsInPlay req:', unitsInPlay,
        'factionUnitsInPlay:', factionUnitsInPlay,
        'result:', result
    );

    return result;
};

module.exports = test;
