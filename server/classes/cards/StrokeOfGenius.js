let Card = require( './Card' );

class StrokeOfGenius extends Card {

    /**
     * Resolve this card ability
     */
    handle(){
        // draw two cards
        this.faction.drawCards(2, true );
    }
}

module.exports = StrokeOfGenius;
