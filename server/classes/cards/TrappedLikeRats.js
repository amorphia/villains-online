let Card = require( './Card' );

class TrappedLikeRats extends Card {
    async handle( faction, area ){
        await faction.nonCombatAttack(5, 1, area ).catch( error => console.error( error ) );
    }
}

module.exports = TrappedLikeRats;
