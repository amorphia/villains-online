let Card = require( './Card' );

class AmpleCover extends Card {
    handle( faction ){
        faction.data.defenseBonus++;
    }

    clear( faction ){
        faction.data.defenseBonus--;
    }
}

module.exports = AmpleCover;
