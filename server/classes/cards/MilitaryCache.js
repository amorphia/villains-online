let Card = require( './Card' );

class MilitaryCache extends Card {
    /**
     * Resolve this card ability
     */
    async handle(){
        await this.faction.move({
            area: this.area,
            toArea : this.area.name,
            fromToken: false,
            canDecline: true,
            moveLimit: 2,
            farMove: false,
            player : this.faction.playerId
        }).catch( error => console.error( error ) );

        // gain +2 to our unit attacks
        this.faction.data.attackBonus += 2;
    }

    clear( faction ){
        // remove our +2 bonus
        faction.data.attackBonus -= 2;
    }
}

module.exports = MilitaryCache;
