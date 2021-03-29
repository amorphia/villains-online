let Card = require( './Card' );

class ChicagoAirlift extends Card {
    async handle( faction, area ){

        let args = {
            area: area,
            faction: faction,
            player: faction.playerId,
            farMove : true,
        };


        let output = await faction.move( args ).catch( error => console.error( error ) );

        if ( output && output.declined ) return;

        return output;
    }
}

module.exports = ChicagoAirlift;
