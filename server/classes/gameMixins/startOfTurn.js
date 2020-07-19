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
        Server.saveToDB( this );
        this.updateAll();
    },

    setStartOfTurnPrompts(){

        _.forEach( this.players, player => {
            let prompt;
            let faction = this.factions[player.data.faction];
            if( faction.name === 'mafia' && !faction.areas().includes( 'police' ) ){
                prompt = { name: 'choose-spy' };
            } else {
                prompt = { name: 'choose-target' };
            }

            player.setPrompt( prompt );
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

    saveSpy( player, spy ){
        if( ! player.data.active ) return;

        this.data.factions[ 'mafia' ].spy = spy;
        player.setPrompt( {name : 'choose-target'});

        this.message({ message: `Is spying on the ${spy}`, faction: player.faction() });
        this.data.playerAction++;
        Server.saveToDB( this );
        this.updateAll();
    }

};


module.exports = obj;
