let Card = require( './Card' );

class Windfall extends Card {

    /**
     * Resolve this card ability
     */
    handle(){
        // gain two resources
        this.faction.gainResources( 2 );
    }
}

module.exports = Windfall;
