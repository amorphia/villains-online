let Card = require( './Card' );

class BenevolentAi extends Card {
    /**
     * Resolve this card ability
     */
    handle(){
        // draw a card
        this.faction.drawCards(1, true );
        // gain +1 card limit
        this.faction.data.cardLimit++;
    }

    clear( faction ){
        // remove card limit
        faction.data.cardLimit--;
    }
}

module.exports = BenevolentAi;
