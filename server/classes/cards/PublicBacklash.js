let Card = require( './Card' );

class PublicBacklash extends Card {
    async handle( faction, area ){
        await faction.nonCombatAttack(5, 2, area ).catch( error => console.error( error ) );
    }
}

module.exports = PublicBacklash;
