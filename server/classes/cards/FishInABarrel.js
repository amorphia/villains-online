let Card = require( './Card' );

class FishInABarrel extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){

        // make three attacks of 4 in this area
        let output = await this.faction.nonCombatAttack(4, 3, this.area )
            .catch( error => console.error( error ) );

        let killedHigherTP = false;
        let factionTP = this.faction.data.ap + this.faction.data.pp;

        if( output.hasKill ){
            output.hasKill.forEach(unit => {
               let faction = this.game.factions[unit.faction];
               let tp = faction.data.ap + faction.data.pp;
                console.log(tp);
               if(tp >= factionTP + 2) killedHigherTP = true;
            });
        }

        console.log(killedHigherTP, factionTP);

        if(killedHigherTP){
            this.game.sound( 'coin' );
            this.faction.gainAP( 1 );
        }
    }
}

module.exports = FishInABarrel;
