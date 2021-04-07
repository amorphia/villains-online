let Card = require( './Card' );

class MilitaryCache extends Card {

    /**
     * Resolve this card ability
     */
    handle(){
        // gain +2 to our unit attacks
        this.faction.data.attackBonus += 2;
    }

    clear( faction ){
        // remove our +2 bonus
        faction.data.attackBonus -= 2;
    }
}

module.exports = MilitaryCache;
