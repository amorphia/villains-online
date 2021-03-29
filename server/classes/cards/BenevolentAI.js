let Card = require( './Card' );

class BenevolentAI extends Card {
    handle( faction ){
        faction.drawCards(1);
        faction.data.cardLimit++;
    }

    clear( faction ){
        faction.data.cardLimit--;
    }
}

module.exports = BenevolentAI;
