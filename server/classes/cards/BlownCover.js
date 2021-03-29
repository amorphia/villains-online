let Card = require( './Card' );

class BlownCover extends Card {
    async handle( faction, area ){
        await faction.game().battle( area, { attackBonus : 4 } ).catch( error => console.error( error ) );
    }
}

module.exports = BlownCover;
