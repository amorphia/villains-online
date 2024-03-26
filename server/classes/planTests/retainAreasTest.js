/**
 * Did this faction capture x areas from other players this turn?
 *
 * @param debug
 * @param faction
 * @param areaCount
 * @returns {boolean}
 */
const test = function retainAreas( debug, faction, areaCount ){
    let retainedAreas = _.intersection( faction.data.retainableAreas, faction.areas() );
    let areasRetainedCount = retainedAreas.length;
    let result = areasRetainedCount >= areaCount;

    if( debug ){
        console.log(
            'retainAreas --- ',
            'areaCount req:', areaCount,
            'factionAreasRetained:', areasRetainedCount,
            'result:', result
        );
    }

    return result;
};

module.exports = test;
