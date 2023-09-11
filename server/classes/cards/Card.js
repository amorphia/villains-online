class Card {

    game;
    faction;
    area;

    /**
     * Resolve this card
     *
     * @param faction
     * @param area
     */
    async resolve( faction, area ){

        // set up our properties
        this.game = faction.game();
        this.faction = faction;
        this.area = area;

        await this.handle();
    }


    /**
     * Resolve this card ability
     */
    async handle(){}


    /**
     * Clear this effect at the end of the turn
     *
     * @param {Faction} faction
     */
    clear( faction ){}


    /**
     * Resolve a deploy from a card
     *
     * @param faction
     * @param area
     * @param options
     * @returns {object}
     */
    async cardDeploy( faction, area, options = {} ) {
        let args = {
            area: area,
            faction: faction,
            player: faction.playerId,
            ...options
        };

        let output = await faction.deploy( args ).catch( error => console.error( error ) );
        if ( output?.declined ) return false;

        return output;
    }

    killedUnitHigherTP( value, output ){
        let killedHigherTP = false;
        let factionTP = this.faction.totalPoints();

        if( output.hasKill ){
            output.hasKill.forEach(unit => {
                let faction = this.game.factions[unit.faction];
                let tp = faction.totalPoints();
                if(tp >= factionTP + value) killedHigherTP = true;
            });
        }

        return killedHigherTP;
    }

}

module.exports = Card;
