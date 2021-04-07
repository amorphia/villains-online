let Card = require( './Card' );

class Massacre extends Card {

    /**
     * Resolve this card ability
     */
    handle(){
        // gain +1 bonus dice
        this.faction.data.bonusDice++;
    }

    clear( faction ){
        // lose our bonus dice
        faction.data.bonusDice--;
    }
}

module.exports = Massacre;
