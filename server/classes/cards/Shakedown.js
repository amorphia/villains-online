let Card = require( './Card' );

class Shakedown extends Card {
    handle( faction, area ){
        let promises = [];

        try {
            _.forEach( faction.game().factions, item => {
                if( item.data.cards.hand.length > 0 && item.name !== faction.name ){
                    console.log( 'shakedown sent to', item.name );
                    promises.push( faction.game().promise({ players: item.playerId, name: 'discard-card', data : { count : 1 } }).then( ([player, data]) => {
                        let eventFaction = faction.game().factions[item.name];
                        eventFaction.discardCard( data.cards );
                        player.setPrompt({ active : false, playerUpdate : true });
                    }));
                }
            });
        } catch (error ){
            console.error( error );
        }

        return Promise.all( promises );

    }
}

module.exports = Shakedown;
