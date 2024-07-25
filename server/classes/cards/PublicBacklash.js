let Card = require( './Card' );


class PublicBacklash extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        // make two attacks of 5 in this area
        let output = await this.faction.nonCombatAttack(5, 2, this.area )
            .catch( error => console.error( error ) );

        //if( !this.game.data.options?.catchUpCards ) return;

        if( this.killedUnitHigherTP( 3, output ) ){
            this.game.sound( 'coin' );
            this.faction.gainPP( 1 );
        }
    }
}

module.exports = PublicBacklash;
