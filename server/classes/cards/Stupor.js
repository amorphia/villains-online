let Card = require( './Card' );

class Stupor extends Card {
    async handle( faction, area ){
        let player, data;

        if( ! _.find( area.data.tokens, token => token.faction !== faction.name && !token.revealed ) ){
            faction.game().message({ faction : faction, message: "No tokens to stupor", class : 'warning'  });
            return false;
        }

        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-tokens',
            data : {
                count : 1,
                areas : [area.name],
                enemyOnly : true,
                unrevealedOnly : true
            }
        }).catch( error => console.error( error ) );

        let token = faction.game().objectMap[data.tokens[0]];
        let tokenSpot = _.discardToken( token, area );
        faction.game().message({ faction : faction, message: `Removes <span class="faction-${token.faction}">the ${token.faction} token</span> from the ${tokenSpot} slot of the ${area.name}` });

    }
}

module.exports = Stupor;
