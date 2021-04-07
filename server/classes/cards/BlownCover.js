let Card = require( './Card' );

class BlownCover extends Card {
    /**
     * Resolve this card ability
     */
    async handle(){
        // start a battle in this area where every unit has +4 to their attack rolls
        await this.game.battle( this.area, { attackBonus : 4 } )
            .catch( error => console.error( error ) );
    }
}

module.exports = BlownCover;
