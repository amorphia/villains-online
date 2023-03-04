let Card = require( './Card' );

class GoWithGod extends Card {

    /**
     * Resolve this card ability
     */
    handle(){
        // draw cards
        this.faction.drawCards(1, true );

        // gain defense bonus
        this.faction.data.defenseBonus += 2;
    }

    clear( faction ){
        faction.data.defenseBonus -= 2;
    }
}

module.exports = GoWithGod;
