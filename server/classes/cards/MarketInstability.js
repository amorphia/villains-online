let Card = require( './Card' );

class MarketInstability extends Card {
    handle( faction, area ){
        _.forEach( faction.game().factions, ( item, name ) => {
            if( name !== faction.name ){
                item.payCost( 1, true );
            }
        });
    }
}

module.exports = MarketInstability;
