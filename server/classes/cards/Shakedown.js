let Card = require( './Card' );

class Shakedown extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        let promises = [];

        // cycle through each faction and make the enemy players discard an action card
        Object.values( this.game.factions ).forEach( faction => {
            promises.push( this.factionChooseCardToDiscard( faction ) );
        });

        await Promise.all( promises );
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
    factionChooseCardToDiscard( faction ){
        if( !this.canFactionDiscardCard( faction ) ) return;

        return this.game.promise({
            players: faction.playerId,
            name: 'discard-card',
            data : { count : 1 }
        }).then( ([player, response]) => this.resolveShakedownDiscard( player, response, faction ) );
    }


    /**
     * Resolve this faction's shakedown discard
     *
     * @param player
     * @param response
     * @param faction
     */
    resolveShakedownDiscard( player, response, faction ){
        faction.discardCards( response.cards );
        player.setPrompt({ active : false, updatePlayerData : true });
    }
}

module.exports = Shakedown;
