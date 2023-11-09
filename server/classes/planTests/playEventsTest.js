/**
 * Does this faction control their target?
 *
 * @param debug
 * @param faction
 * @param count
 * @returns {boolean}
 */
const test = function playEvents( debug, faction, count ) {
    let result = faction.data.eventCardsPlayed >= count;

    if( debug ) console.log(
        'playEvents ---',
        'eventCardsPlayed:', faction.data.eventCardsPlayed,
        'count:', count,
        'result:', result
    );

    return result;
};

module.exports = test;
