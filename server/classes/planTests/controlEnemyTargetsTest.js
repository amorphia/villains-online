/**
 * Does this faction control x enemy targets?
 *
 * @param debug
 * @param faction
 * @param targetCount
 * @returns {boolean}
 */
const test = function controlEnemyTargets( debug, faction, targetCount ){
    let areasControlled = faction.areas();
    let ignoredAreas = faction.game().data.ignoredAreas;
    let enemyTargetsControlled = 0;

    Object.values( faction.game().factions ).forEach( factionItem => {
        if( factionItem.name === faction.name ) return;

        let target = factionItem.targetName();

        // if we control this target or if an opponent played a target in a blocked area
        if( areasControlled.includes( target ) || ignoredAreas.includes( target ) ) enemyTargetsControlled++;
    });

    let result = enemyTargetsControlled >= targetCount;

    if( debug ) console.log(
        'controlEnemyTargets ---',
        'targetCount req:', targetCount,
        'factionEnemyTargetsControlled:', enemyTargetsControlled,
        'result:', result
    );

    return result;
};

module.exports = test;
