/**
 * Has this faction killed x units this turn?
 *
 * @param debug
 * @param faction
 * @param killedUnits
 * @returns {boolean}
 */
const test = function killUnits( debug, faction, killedUnits ) {
    let factionKilledUnits = faction.totalKills();
    let result = factionKilledUnits >= killedUnits;

    if( debug ) console.log(
        'killUnits',
        'killedUnits req:', killedUnits,
        'factionKilledUnits:', factionKilledUnits,
        'result:', result
    );

    return result;
}

module.exports = test;
