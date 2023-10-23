let obj = {

    /**
     * Begin the take actions step
     */
    async startTakeActionsStep(){
        // set phase
        this.data.phase = "take-actions";
        // show title card
        await this.timedPrompt( 'title-card', { wait: this.titleCardTimer, message : 'Take Actions Step' } )
            .catch( error => console.error( error ) );
        // set our default listener/prompt
        this.defaultListener = 'choose-action';

        // set active player
        this.setActivePlayerByPlayerOrder();
        this.setActivePlayerListener();

        // remove passed flag from all players
        this.setPropsForAllPlayers({ passed : false } );

        Server.saveToDB( this );
        await this.pushGameDataToPlayers();
    },


    /**
     * Handles a player's choice of action response by formatting their action string response into a method name
     * And calling that method on the appropriate instance
     *
     * @param player
     * @param action
     * @param args
     */
    chooseAction( player, action, ...args ) {
        let method = _.camelCase(`take-${action}-action`);


        // if this method exists on the faction object call it
        let faction = player.faction();
        if( typeof faction[method] === 'function' ){
            faction[method](player, ...args);
            return;
        }

        //otherwise it should be a method on the game object, so call that instead
        if( typeof this[method] === 'function' ){
            this[method](player, ...args);
            return;
        }

        throw 'No matching action method';
    },


    /**
     * Handle a player's pass action
     *
     * @param player
     */
    takePassAction( player ){
        player.data.passed = true;
        this.message({ message: `Have passed`, faction : player.faction() });

        // if all players have passed start the combat step
        if( this.allPlayersHavePassed() ){
            this.data.gameAction++;
            this.startCombatStep();
            return;
        }

        // otherwise advance to the next player
        this.advancePlayer();
    },


    /**
     * Handle a player to declare themselves locked for their action, simply advancing to the next action
     *
     * @param player
     */
    async takeLockedAction( player ){
        let faction = player.faction();
        await faction.lockedAction( player );
        this.advancePlayer( {} );
    },


    /**
     * Handle a player activating a skill for their action
     *
     * @param player
     * @param areaName
     */
    async takeSkillAction( player, areaName ){
        let area = this.areas[areaName];
        let faction = player.faction();
        let advance = true;
        let exhaustedUnits;

        try {
            exhaustedUnits = await faction.useSkill( area );
        } catch( error ){
            console.error( error );
        }

        if( exhaustedUnits && exhaustedUnits.some( event => event.unit.exhaustExtraAction ) ){
            advance = false;
        }

        this.advancePlayer( {}, advance );
    },


    /**
     * Handle a player revealing a token for their action
     *
     * @param player
     * @param tokenId
     * @param wildType
     */
    async takeTokenAction( player, tokenId, wildType = null ){
        let token = this.objectMap[tokenId];
        let area = this.areas[token.location];

        let faction = player.faction();
        try {
            await faction.revealToken( player, token, area, wildType );
        } catch( error ){
            console.error( error );
        }
    },


    /**
     * Handle the player response to an "activate or decline this token" prompt
     *
     * @param player
     * @param action
     * @param tokenId
     * @param wildType
     */
    activateDecline( player, action, tokenId, wildType = null ){
        let token = this.objectMap[tokenId];

        if( action === 'decline' ){
            this.declineToken( player, token );
        } else {
            player.faction().activateToken( player, token, wildType );
        }
    },


    /**
     * Handle declining and removing a token
     *
     * @param player
     * @param token
     * @param refund
     */
    declineToken( player, token, refund ){
        if( typeof player === 'string' ) player = this.getPlayerById( player );

        let message;
        let area = this.areas[ token.location ];
        let faction = player.faction();

        // discard the token from play
        _.discardToken( token, area );

        // issue a refund for any costs is appropriate
        if( refund ) this.checkForTokenRefund( token, area );

        message = `Pull their <span class="uppercase highlight">${token.name}</span> token`;
        this.message({ message: message, faction : faction });
        this.advancePlayer();
    },


    /**
     * Refund any energy spent to play a token that was instead discarded
     *
     * @param token
     * @param area
     */
    checkForTokenRefund( token, area ) {
        let faction = this.factions[token.faction];

        // did this player actually spend any energy to play this token before they changed their mind?
        let refund = faction.tokenCost( token, area );

        // if so, refund that energy
        if( refund ){
            faction.data.energy += refund;
        }
    },

};

module.exports = obj;
