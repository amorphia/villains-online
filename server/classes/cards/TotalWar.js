let Card = require( './Card' );

class TotalWar extends Card {

    /**
     * Resolve this card ability
     */
    handle(){
        Object.values( this.game.areas ).forEach( area => area.data.battle = true );
        this.faction.data.attackBonus += 1;
    }

    clear( faction ){
        faction.data.attackBonus -= 1;
    }
}


module.exports = TotalWar;
