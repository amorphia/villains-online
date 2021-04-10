/**
 * Does this faction have at least x influence in the given number of areas?
 *
 * @param debug
 * @param faction
 * @param influenceCount
 * @param areaCount
 * @returns {boolean}
 */
const test = function influenceInAreas( debug, faction, influenceCount, areaCount = 1 ) {
    let areasWithEnoughInfluence = faction.areasWithMinInfluence( influenceCount );
    let result = areasWithEnoughInfluence >= areaCount;

    if( debug ) console.log(
        'influenceInAreas',
        'influenceCount req:', influenceCount,
        'areaCount req:', areaCount,
        'areasWithEnoughInfluence:', areasWithEnoughInfluence,
        'result:', result
    );

    return result;
};

module.exports = test;
