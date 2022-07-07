/**
 * Has this faction played x cards with Mr Fusion?
 *
 * @param debug
 * @param faction
 * @param fusionCount
 * @returns {number|boolean}
 */
const test = function mrFusion( debug, faction, fusionCount ){
    let factionFusionCount = faction.data.fusion;
    let result = factionFusionCount && factionFusionCount >= fusionCount;

    if( debug ) console.log(
        'mrFusion ---',
        'fusionCount req:', fusionCount,
        'factionFusionCount:', factionFusionCount,
        'result:', result
    );

    return result;
};

module.exports = test;
