let Area = require( './Area' );

class Bank extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You gain xRx at the start of the turn.";
        this.data.skill = "Gain xRxxRx";
        this.data.adjacent = [ 'factory', 'capitol', 'university' ];
    }


    /**
     * Resolve this area's skill ability
     *
     * @param faction
     */
    skill( faction ){
        faction.gainResources( 2 );
    }
}

module.exports = Bank;
