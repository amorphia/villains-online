let Card = require( './Card' );

class MilitaryCache extends Card {
    handle( faction ){
        faction.data.attackBonus += 2;
    }

    clear( faction ){
        faction.data.attackBonus -= 2;
    }
}

module.exports = MilitaryCache;
