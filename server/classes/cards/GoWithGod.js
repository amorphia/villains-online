let Card = require( './Card' );

class GoWithGod extends Card {

    /**
     * Resolve this card ability
     */
    handle(){
        // gain defense bonus
        this.faction.data.defenseBonus += 2;
    }

    clear( faction ){
        faction.data.defenseBonus -= 2;
    }
}

module.exports = GoWithGod;
