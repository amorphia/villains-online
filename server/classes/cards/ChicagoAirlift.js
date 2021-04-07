let Card = require( './Card' );

class ChicagoAirlift extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){

        let args = {
            area: this.area,
            faction: this.faction,
            player: this.faction.playerId,
            farMove : true,
        };

        // take a move action
        let output = await this.faction.move( args )
            .catch( error => console.error( error ) );

        // if we declined return nothing
        if ( output?.declined ) return;

        // otherwise return our output
        return output;
    }
}

module.exports = ChicagoAirlift;
