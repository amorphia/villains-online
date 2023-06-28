/**
 * Does this faction control x targets?
 *
 * @param debug
 * @param faction
 * @param targetCount
 * @returns {boolean}
 */
const test = function controlTargets( debug, faction, targetCount ){
    let areasControlled = faction.areas();
    let ignoredAreas = faction.game().data.ignoredAreas;
    let targetsControlled = 0;

    Object.values( faction.game().factions ).forEach( factionItem => {
            let target = factionItem.targetName();

            // if we control this target
            if( areasControlled.includes( target ) )  targetsControlled++;

            // if an opponent played a target in a blocked area
            if( ignoredAreas.includes( target ) && factionItem.name !== faction.name ) targetsControlled++;
    });

    let result = targetsControlled >= targetCount;

    if( debug ) console.log(
        'controlTargets ---',
        'targetCount req:', targetCount,
        'factionTargetsControlled:', targetsControlled,
        'result:', result
    );

    return result;
};

module.exports = test;
