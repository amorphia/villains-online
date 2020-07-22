let obj = {

    async startPlaceTokensStep(){
        this.data.state = "action-step";
        this.data.phase = "place-tokens";
        await this.timedPrompt( 'title-card', 4, { message : 'Place Tokens Step' } );
        this.defaultListener = 'place-token';

        this.setActivePlayerByPlayerOrder();
        this.setActivePlayerListener();
        this.allPlayers({ passed : false } );
        Server.saveToDB( this );
        this.updateAll();
    },

    placeAToken( player, areaId, tokenId ){
        let message;
        let faction = player.faction();
        let token = this.objectMap[ tokenId ];


        faction.payCost( faction.data.tokenCost );
        token.location = areaId;

        if( areaId === 'xavier' ){
            this.data.factions['society'].units.find( unit => unit.type === 'champion' ).token = token;
            message = `Place a token on <span class="faction-society">Xavier Blackstone</span>`;
        } else {
            let area = this.areas[areaId];
            area.data.tokens.push( token );
            this.checkForCombatMarker( area );
            message = `Place a token in <span class="highlight">the ${area.name}</span>`;
        }

        this.message({ message: message, faction : faction });
        this.data.playerAction++;
        this.advancePlayer();
    },

    placeToken( player, action, ...args ){
        if( action === 'place'){
            this.placeAToken( player, ...args );
        } else if( action === 'pass' ){
            this.passToken( player );
        }
    },

    checkForCombatMarker( area ){
        if( area.data.tokens.length >= Object.keys( this.players ).length ){
            area.data.battle = true;
        }
    },

    passToken( player ){
        player.data.passed = true;
        this.message({ message: `Have passed`, faction : player.faction() });
        this.data.playerAction++;
        if( this.allPlayersHavePassed() ){
            this.startTakeActionsStep();
        } else {
            this.advancePlayer();
        }
    }


};

module.exports = obj;
