let Card = require( './Card' );

class ToTheDeath extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        // deploy a free unit
        await this.cardDeploy( this.faction, this.area, { free: true, deployLimit: 1, basicOnly: true } )
            .catch( error => console.error( error ) );

        this.keepFighting = true;

        while( this.keepFighting ){
            // battle
            await this.game.battle( this.area ).catch( error => console.error( error ) );

            // should we keep going?
            await this.doesAnyoneWantToKeepFighting();
        }
    }


    /**
     * Ask each player if they want to keep fighting
     *
     * @returns {boolean}
     */
    async doesAnyoneWantToKeepFighting(){
        this.keepFighting = false;

        // if its no longer possible to battle return false
        if( !this.area.canBattle() ) return;

        let promises = [];

        // ask each player if they want to fight
        for( let factionName of this.area.factionsWithUnits() ) {
            promises.push( this.promptPlayerToKeepFighting( factionName ) );
        }

        await Promise.all( promises );
    }


    /**
     * Ask a player if they want to keep fighting
     *
     * @param factionName
     * @returns {Promise}
     */
    async promptPlayerToKeepFighting( factionName ) {
        let faction = this.game.factions[factionName];

        return this.game.promise({
                players: faction.playerId,
                name: 'question',
                data: { message: `Continue battling in the ${this.area.name}?` }
            }).then( ([player, response]) => this.handleKeepFightingResponse( player, response, faction ) )
    }


    /**
     * Handle a faction's keepFighting choice
     *
     * @param player
     * @param response
     * @param faction
     */
    handleKeepFightingResponse( player, response, faction ){
        player.setPrompt( { active : false, updatePlayerData : true } );
        let message = `The ${faction.name} have had enough bloodshed`;

        // if this faction wants to keep going set keepFighting
        if( response.answer === true ){
            this.keepFighting = true;
            message = `The ${faction.name} are still hungry for blood`;
        }

        this.game.message({ message : message, class : 'warning' });
    }
}

module.exports = ToTheDeath;
