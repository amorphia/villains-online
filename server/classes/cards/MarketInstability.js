let Card = require( './Card' );

class MarketInstability extends Card {
    /**
     * Resolve this card ability
     */
    handle(){
        // cycle through each faction, any player that isn't us must pay {1}
        Object.values( this.game.factions ).forEach( faction => {
            if( faction.name !== this.faction.name ) faction.payCost( 1, true );
        });
    }
}

module.exports = MarketInstability;
