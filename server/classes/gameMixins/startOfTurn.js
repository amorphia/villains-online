let obj = {

    /**
     * Resolve the start of turn step
     */
    async resolveStartOfTurnStep() {

        // set phase and state
        this.data.state = "start-of-turn";
        this.data.phase = "plans-and-targets";

        // at the start of the game reverse the player order from what we
        // had used while picking factions
        if( this.data.turn === 1 ) this.data.playerOrder.reverse();

        // save a game save state to the DB
        Server.saveToDB( this, { type:'turn', note: 'start-of-turn' } );

        // Show start of turn title card
        let data = {
            wait : this.titleCardTimer,
            message : 'Start of Turn',
            type : 'turn'
        };

        if( this.data.turn === 4 && this.doubleTargetsFourthTurn ) data.showDoubleAP = true;

        try{
            await this.timedPrompt( 'title-card', data );
        } catch( error ){
            console.error( error );
        }

        this.handleStartOfTurn();
    },


    /**
     * Handle the core start of turn steps
     */
    async handleStartOfTurn(){

        // Each faction draws their action cards, resets their energy, and draws their plan cards
        Object.values( this.factions ).forEach( faction => {
            faction.drawTurnCards();
            faction.resetEnergy();
            faction.drawPlans();
        });

        this.gainBankResource();

        // handle start of turn triggers
        await this.handleStartOfTurnTriggers();

        // set all players as active
        this.setAllPlayersActive();

        // give each player their start of turn prompt
        this.setStartOfTurnPrompts();

        // push our game data to each player
        await this.pushGameDataToPlayers();
    },

    gainBankResource(){
        const owner = this.areas['bank'].data.owner;
        if(!owner || owner === "neutral" ) return;

        this.factions[owner].gainResources(1);
        this.message({ message: 'Gain xRx for controlling the Bank', faction : owner });
    },

    /**
     * Handle our faction start of turn triggers
     */
    async handleStartOfTurnTriggers(){

        //  handle parallel triggers
        let promises = [];

        // Check for start of turn triggers
        for( let faction of Object.values( this.factions ) ){
            if( faction.triggers.onStartOfTurn ) promises.push( faction[faction.triggers.onStartOfTurn]() );
        }

        // wait for serial triggers to resolve
        await Promise.all( promises );

        // handle serial triggers
        for( let faction of Object.values( this.factions ) ){
            if( faction.triggers.onStartOfTurnSerial ) await faction[faction.triggers.onStartOfTurnSerial]();
        }
    },


    /**
     * Sets the start of turn prompt for each player
     */
    setStartOfTurnPrompts(){
        _.forEach( this.players, player => {
            let faction = this.factions[player.data.faction];
            player.setPrompt( 'choose-target' );
        });
    },


    /**
     * Handle a player's response to the "Choose Target and Plan" prompt
     *
     * @param player
     * @param plan
     * @param target
     */
    async chooseTargetPlan( player, plan, target ){
        if( ! player.data.active ) return;

        let faction = player.faction();

        // if we have selected a plan to discard move it to the bottom of their plans deck
        if( plan ) _.moveItemById( plan.id, faction.data.plans.current, faction.data.plans.deck );

        // move the player's chosen target card from their hand to their target array
        _.moveItemById( target.id, faction.data.cards.hand, faction.data.cards.target );

        // track our card targeting
        this.cardTracker[target.class].target++;

        // de-select target card if was selected randomly
        let targetCard = this.objectMap[ target.id ];
        if( targetCard.randomTarget ) delete targetCard.randomTarget;

        // clear the player's prompt and remove their active status
        player.setPrompt({
            name : null,
            active : false
        });


        this.message({ message: 'Have chosen their Target', faction : faction });
        this.data.gameAction++;

        // if no player is still active in this step, advance to the place tokens step
        if( this.allPlayersAreInactive() ){
            this.startPlaceTokensStep();
            return;
        }

        // save and update all players
        Server.saveToDB( this );
        await this.pushGameDataToPlayers();
    },


    /**
     * If a faction has a unique start of turn prompt handle their response
     *
     * @param player
     * @param data
     */
    factionStartOfTurnResponse( player, data ){
        if( ! player.data.active ) return;
        player.faction().resolveStartOfTurn( player, data );
    },


};


module.exports = obj;
