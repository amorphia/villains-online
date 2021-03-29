let Card = require( './Card' );

class GoGoGo extends Card {
    handle( faction ){
        faction.data.deployLimit++;
        faction.gainResources( 1 );
    }

    clear( faction ){
        faction.data.deployLimit--;
    }
}

module.exports = GoGoGo;
