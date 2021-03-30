let obj = {
    async startCombatStep(){
        this.data.phase = "combat-phase";

        await this.timedPrompt( 'title-card', { wait : this.titleCardTimer, message : 'Combat Step' } )
            .catch( error => console.error( error ) );

        this.defaultListener = null;
        this.allPlayers({ passed : false } );
        this.clearAllPlayerPrompts();
        await this.pushGameDataToPlayers();

        this.resolveCombatStep();
    },

    areasWithBattleMarkers(){
        let areas = [];
        _.forEach( this.areas, area => {
           if( area.data.battle ) areas.push( area );
        });
        return areas;
    },

    async resolveCombatStep(){
        let areas = this.areasWithBattleMarkers();

        try {
            if (areas.length) {
                for (let i = 0; i < areas.length; i++) {
                    await this.battle(areas[i]);
                }
            }

            for (let faction in this.factions) {
                await this.factions[faction].onAfterCombatStep();
            }
        } catch( error ){
            console.error( error );
        }
        this.startEndOfTurnStep();
    }

};

module.exports = obj;
