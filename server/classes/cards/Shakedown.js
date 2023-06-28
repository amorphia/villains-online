let Card = require( './Card' );

class Shakedown extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        let promises = [];

        // cycle through each faction and make the enemy players discard an action card
        Object.values( this.game.factions ).forEach( faction => {
            if( !this.canFactionDiscardCard( faction ) ) return;
            promises.push( this.factionChooseCardToDiscard( faction ) );
        });

        let responses = await Promise.all( promises );

        for( let response of responses ) {
            response.faction.discardCards( response.cards );
        }
    }


    /**
     * Can this faction discard a card?
     *
     * @param faction
     * @returns {boolean}
     */
    canFactionDiscardCard( faction ){
        return faction.data.cards.hand.length > 0 && faction.name !== this.faction.name;
    }


    /**
     * Prompt a faction to choose a card to discard
     *
     * @param faction
     * @returns {Promise|undefined}
     */
    async factionChooseCardToDiscard( faction ){
        let [player, response] = await this.game.promise({
            players: faction.playerId,
            name: 'discard-card',
            data : { count : 1 }
        });

        await this.game.updatePlayerData();

        return {
            player,
            faction,
            cards : response.cards,
        }
    }
}

module.exports = Shakedown;
