/**
 * Does this faction control x players targets?
 *
 * @param debug
 * @param faction
 * @param targetCount
 * @returns {boolean}
 */
const test = function controlAnyTarget( debug, faction, targetCount ){
    let areasControlled = faction.areas();

    let targetsControlled = Object.values( faction.game().factions )
        .map( item => {
            return areasControlled.includes( item.targetName() ); // areas we control includes their target
        }).filter( item => item ).length; // get rid of false values

    let result = targetsControlled >= targetCount;

    if( debug ) console.log(
        'controlAnyTargets',
        'targetCount req:', targetCount,
        'factionTargetsControlled:', targetsControlled,
        'result:', result
    );

    return result;
};

module.exports = test;
