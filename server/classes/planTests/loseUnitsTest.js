/**
 * Has this faction lost x units this turn?
 *
 * @param debug
 * @param faction
 * @param lostUnits
 * @returns {boolean}
 */
const test = function loseUnits( debug, faction, lostUnits ){
    let factionLostUnits = faction.data.units.filter( unit => unit.killed ).length;
    let result = factionLostUnits >= lostUnits;

    if( debug ) console.log (
        'loseUnits',
        'lostUnits req:', lostUnits,
        'factionLostUnits:', factionLostUnits,
        'result:', result
    );

    return result;
};

module.exports = test;
