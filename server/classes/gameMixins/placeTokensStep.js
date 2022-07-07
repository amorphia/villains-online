let obj = {

    /**
     * Begin the place tokens step
     */
    async startPlaceTokensStep(){

        // set state, phase,and default listener / prompt
        this.data.state = "action-step";
        this.data.phase = "place-tokens";
        this.defaultListener = 'place-token';

        // show title card
        await this.timedPrompt( 'title-card',{ wait : 4, message : 'Place Tokens Step' } )
            .catch( error => console.error( error ) );

        // set the first player in player order active and set their listener / prompt
        this.setActivePlayerByPlayerOrder();
        this.setActivePlayerListener();

        // no players have passed yet
        this.setPropsForAllPlayers({ passed : false } );

        // save to DB and push game data
        Server.saveToDB( this );
        await this.pushGameDataToPlayers();
    },


    /**
     * Handle the player response from the "place token" prompt
     *
     * @param player
     * @param action
     * @param args
     */
    placeToken( player, action, ...args ){

        if( action === 'place'){
            this.resolveTokenPlacement( player, ...args );
            return;
        }

        if( action === 'ghost'){
            let faction = player.faction();
            faction.placeGhost( this, ...args );
            return;
        }

        if( action === 'pass' ){
            this.passOnPlacingToken( player );
            return;
        }

        throw "Invalid response to place token prompt"
    },


    /**
     * Handle the placement of a token
     *
     * @param player
     * @param areaId
     * @param tokenId
     */
    resolveTokenPlacement( player, areaId, tokenId ){
        let message, areaName;
        let faction = player.faction();
        let token = this.objectMap[ tokenId ];

        // pay any costs to place this token
        faction.payCost( faction.data.tokenCost );

        // set token location
        token.location = areaId;

        // if we are placing our token on xavier blackstone do this weird stuff, because he is weird
        if( areaId === 'xavier' ){
            let xavier = this.factions['society'].getChampion();
            xavier.token = token;
            areaName = xavier.location;
            message = `Place a token on <span class="faction-society">Xavier Blackstone</span>`;
        } else {
            // otherwise place our token in an area like a non-weirdo
            let area = this.areas[areaId];
            areaName = area.name;
            area.data.tokens.push( token );
            this.checkForCombatMarker( area );
            message = `Place a token in the ${area.name}`;
        }

        // display this placement all players
        this.popup( faction.playerId, { type: 'place', area : areaName, faction: faction.name });
        this.message({ message: message, faction : faction });

        // advance game
        this.data.gameAction++;
        this.advancePlayer();
    },


    /**
     * Check if this area now need a combat marker placed in it
     *
     * @param area
     */
    checkForCombatMarker( area ){
        // does this area have tokens equal to or greater than the player count? If so, battle marker!
        if( area.data.tokens.length >= Object.keys( this.players ).length ){
            area.data.battle = true;
        }
    },


    /**
     * Handle a player passing on placing more tokens
     *
     * @param player
     */
    passOnPlacingToken( player ){
        player.data.passed = true;
        this.message({ message: `Have passed`, faction : player.faction() });

        // if all players have passed advance the game to the take actions step
        if( this.allPlayersHavePassed() ){
            this.data.gameAction++;
            this.startTakeActionsStep();
            return;
        }

        // otherwise advance to the next player
        this.advancePlayer();
    }

};

module.exports = obj;
