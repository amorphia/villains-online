/**
 * Does this faction have x action cards in hand?
 *
 * @param debug
 * @param faction
 * @param cardCount
 * @returns {boolean}
 */
const test = function cardsInHand( debug, faction, cardCount ){
    let factionCardsInHand = faction.data.cards.hand.length;
    let result = factionCardsInHand >= cardCount;

    if( debug ) console.log(
        'cardsInHand ---',
        'cardCount req:', cardCount,
        'factionCardsInHand:', factionCardsInHand,
        'result:', result
    );

    return result;
};

module.exports = test;
