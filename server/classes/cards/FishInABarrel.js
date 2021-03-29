let Card = require( './Card' );

class FishInABarrel extends Card {
    async handle( faction, area ){
        await faction.nonCombatAttack(4, 3, area ).catch( error => console.error( error ) );
    }
}

module.exports = FishInABarrel;
