/**
 * Does this faction control x areas?
 *
 * @param debug
 * @param faction
 * @param ties
 * @returns {boolean}
 */
const test = function controlMostAreas( debug, faction, ties = true ){
    let factionAreasControlled = faction.areas().length;

    let mostEnemy = 0;

    Object.values( faction.game().factions ).forEach( enemy => {
       if( enemy.name === faction.name ) return;
       const owned = enemy.areas().length;
       if( owned > mostEnemy ) mostEnemy = owned;
    });

    let result = ties ?
        (factionAreasControlled >= mostEnemy)
        :(factionAreasControlled > mostEnemy) ;

    if( debug ) console.log(
        'controlMostAreas ---',
        'mostEnemy req:', mostEnemy,
        'ties?', ties,
        'factionAreasControlled:', factionAreasControlled,
        'result:', result
    );

    return result;
};

module.exports = test;
