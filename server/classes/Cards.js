let cards = require( './data/cardList' );

// Build our export object collecting each card class using the list of card names
let exportCards = {};
cards.forEach( card => {
    let className = _.startCase( card.class ).replace( / /g, '' );
    exportCards[card.class] = require( `./cards/${className}` );
});

module.exports = exportCards;



