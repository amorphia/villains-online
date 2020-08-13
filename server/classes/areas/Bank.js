let Area = require( './Area' );

class Bank extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You gain an extra xRx during the COLLECT RESOURCES step.";
        this.data.skill = "Gain xRxxRx";
        this.data.adjacent = [ 'factory', 'capitol', 'university' ];
    }

    skill( faction ){
        faction.gainResources( 2 );
    }
}

module.exports = Bank;
