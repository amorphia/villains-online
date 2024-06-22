/**
 * Has this faction killed x units this turn?
 *
 * @param debug
 * @param faction
 * @param killedUnits
 * @returns {boolean}
 */
const test = function killCondemnedUnits( debug, faction, killedUnits ) {
    let factionKilledUnits = faction.condemnedKills();
    let result = factionKilledUnits >= killedUnits;

    if( debug ) console.log(
        'killCondemnedUnits ---',
        'killedUnits req:', killedUnits,
        'factionKilledUnits:', factionKilledUnits,
        'result:', result
    );

    return result;
}

module.exports = test;
