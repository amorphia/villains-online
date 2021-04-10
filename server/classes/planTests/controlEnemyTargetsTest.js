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

    let enemyTargetsControlled = Object.values( faction.game().factions )
        .map( item => {
            return item.name !== faction.name // if this faction is not us
                && areasControlled.includes( item.targetName() ); // and areas we control includes their target
        }).filter( item => item ).length; // get rid of false values

    let result = enemyTargetsControlled >= targetCount;

    if( debug ) console.log(
        'controlEnemyTargets',
        'targetCount req:', targetCount,
        'factionEnemyTargetsControlled:', enemyTargetsControlled,
        'result:', result
    );

    return result;
};

module.exports = test;
