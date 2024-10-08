let Card = require( './Card' );

class FishInABarrel extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){

        // make three attacks of 4 in this area
        let output = await this.faction.nonCombatAttack(4, 3, this.area )
            .catch( error => console.error( error ) );

        //if( !this.game.data.options?.catchUpCards ) return;

        if( this.killedUnitHigherTP( 3, output ) ){
            this.game.sound( 'coin' );
            this.faction.gainPP( 1 );
        }
    }
}

module.exports = FishInABarrel;
