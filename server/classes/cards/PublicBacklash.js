let Card = require( './Card' );


class PublicBacklash extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        // make two attacks of 5 in this area
        await this.faction.nonCombatAttack(5, 2, this.area )
            .catch( error => console.error( error ) );
    }
}

module.exports = PublicBacklash;
