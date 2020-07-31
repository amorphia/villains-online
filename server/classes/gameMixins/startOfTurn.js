let obj = {
    async startTurn() {
        this.data.state = "start-of-turn";
        this.data.phase = "plans-and-targets";
        await this.timedPrompt( 'title-card', this.titleCardTimer, { message : 'Start of Turn' } );


        _.forEach(this.factions, (faction, name) => {
            faction.drawTurnCards();
            faction.resetEnergy();
            faction.drawPlans();
        });

        this.setAllPlayersActive();
        this.setStartOfTurnPrompts();
        Server.saveToDB( this, { type:'turn' } );
        this.updateAll();
    },

    setStartOfTurnPrompts(){
        _.forEach( this.players, player => {
            let prompt;
            let faction = this.factions[player.data.faction];
            player.setPrompt( faction.startOfTurnPrompt() );
        });
    },

    chooseTargetPlan( player, planIndex, targetIndex ){
        if( ! player.data.active ) return;

        let faction = player.faction();
        _.moveItem( planIndex, faction.data.plans.current, faction.data.plans.deck );
        _.moveItem( targetIndex, faction.data.cards.hand, faction.data.cards.target );

        player.setPrompt({
            name : null,
            active : false
        });

        this.message({ message: 'Have chosen their Target', faction : faction });
        this.data.playerAction++;

        if( this.allPlayersInactive() ){
            this.startPlaceTokensStep();
        } else {
            Server.saveToDB( this );
            this.updateAll();
        }
    },

    factionStartOfTurnResponse( player, data ){
        if( ! player.data.active ) return;
        player.faction().resolveStartOfTurn( player, data );
    },


};


module.exports = obj;
