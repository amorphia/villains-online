let Card = require( './Card' );

class TrappedLikeRats extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        // make 1 non-combat attack of 5 in this area
        await this.faction.nonCombatAttack( 5, 1, this.area )
            .catch( error => console.error( error ) );
    }
}

module.exports = TrappedLikeRats;
