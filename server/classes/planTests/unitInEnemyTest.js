/**
 * Does this faction of x units of a given type in enemy areas?
 *
 * @param debug
 * @param faction
 * @param unitType
 * @param unitCount
 * @returns {boolean}
 */
const test = function unitInEnemy( debug, faction, unitType, unitCount ){
    let enemyAreas = [];

    _.forEach( faction.game().areas, area => {
        if( area.data.owner && area.data.owner !== faction.name ) enemyAreas.push( area.name );
    });

    let factionUnitCount = faction.data.units.reduce( (acc, unit) => {
        if( unit.type === unitType
            && !unit.killed
            && enemyAreas.includes( unit.location )
        ) acc++;
        return acc;
    }, 0 );

    let result = factionUnitCount >= unitCount;

    if( debug ) console.log (
        'unitInEnemy ---',
        'unitType req:', unitType,
        'unitCount req:', unitCount,
        'factionUnitCount:', factionUnitCount,
        'result:', result
    );

    return result;
};

module.exports = test;
