let Card = require( './Card' );

class CloakAndDagger extends Card {

    /**
     * Resolve this card ability
     */
    handle(){
        let champions = this.faction.data.units.filter( unit => _.isChampion( unit ) );

        champions.forEach( unit => {
           if( unit.hidden ){
               unit.noClearCloakAndDagger = true;
               return;
           }

           unit.hidden = true;
        });
    }

    clear( faction ){
        let champions = faction.data.units.filter( unit => _.isChampion( unit ) );

        champions.forEach( unit => {
            if( unit.noClearCloakAndDagger ){
                delete unit.noClearCloakAndDagger;
                return;
            }

            delete unit.hidden;
        });
    }

}

module.exports = CloakAndDagger;
