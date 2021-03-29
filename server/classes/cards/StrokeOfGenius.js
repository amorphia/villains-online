let Card = require( './Card' );

class StrokeOfGenius extends Card {
    handle( faction ){
        faction.drawCards(2);
    }
}

module.exports = StrokeOfGenius;
