let Card = require( './Card' );

class AllHollowsEve extends Card {

    reviveCount = 4;

    /**
     * Resolve this card ability
     */
    async handle(){
        await this.faction.reviveUnits( { reviveCount: this.reviveCount } );
    }

}

module.exports = AllHollowsEve;
