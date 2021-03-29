let Card = require( './Card' );

class Windfall extends Card {
    handle( faction ){
        faction.gainResources( 2 );
    }
}

module.exports = Windfall;
