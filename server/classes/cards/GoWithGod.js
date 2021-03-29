let Card = require( './Card' );

class GoWithGod extends Card {
    handle( faction ){
        faction.data.defenseBonus += 2;
    }

    clear( faction ){
        faction.data.defenseBonus -= 2;
    }
}

module.exports = GoWithGod;
