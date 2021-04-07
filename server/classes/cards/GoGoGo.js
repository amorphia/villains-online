let Card = require( './Card' );

class GoGoGo extends Card {

    /**
     * Resolve this card ability
     */
    handle(){
        // gain a deploy limit
        this.faction.data.deployLimit++;
        // and a resource
        this.faction.gainResources( 1 );
    }

    clear( faction ){
        // lose our deploy unit
        faction.data.deployLimit--;
    }
}

module.exports = GoGoGo;
