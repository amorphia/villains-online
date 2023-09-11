let obj = {

    /**
     * Begin resolving the combat step
     */
    async startCombatStep(){
        //set phase
        this.data.phase = "combat-phase";

        // show title card
        await this.timedPrompt( 'title-card', { wait : this.titleCardTimer, message : 'Combat Step' } )
            .catch( error => console.error( error ) );

        // prep player prompts and whatnot
        this.defaultListener = null;
        this.setPropsForAllPlayers({ passed : false } );
        this.clearAllPrompts();
        await this.pushGameDataToPlayers();

        // resolve the combat step
        this.resolveCombatStep();
    },


    /**
     * Resolve the combat step
     */
    async resolveCombatStep(){

        // get the areas with battle markers
        let areas = this.areasWithBattleMarkers();

        try {
            for(let area of areas ){
                await this.battle( area );
            }

            // then check each faction for any onAfterCombatStep triggers
            for(let faction of Object.values( this.factions ) ) {
                if( faction.triggers.onAfterCombatStep ) await faction[faction.triggers.onAfterCombatStep]();
            }
        } catch( error ){
            console.error( error );
        }

        Server.saveToDB( this, { type:'turn', note: 'post-combat' } );

        // move to the end of turn step
        this.resolveEndOfTurnStep();
    },


    /**
     * Returns an array of the areas with battle markers
     *
     * @returns {array}
     */
    areasWithBattleMarkers(){
        if(this.data.ActivatedTokenCombat){
            return this.areasWithMinimumActivatedTokens();
        }
        return Object.values( this.areas ).filter( area => area.data.battle );
    },

    areasWithMinimumActivatedTokens(){
        return Object.values( this.areas ).filter( area => area.tokenCount() >= (this.data.playerOrder.length - 1) );
    }
};

module.exports = obj;
