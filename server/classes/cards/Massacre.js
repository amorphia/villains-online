let Card = require( './Card' );

class Massacre extends Card {
    handle( faction ){
        faction.data.bonusDice++;
    }

    clear( faction ){
        faction.data.bonusDice--;
    }
}

module.exports = Massacre;
