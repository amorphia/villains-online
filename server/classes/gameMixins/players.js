let mixin = {

    /**
     * Does this game have a player with the given Id?
     *
     * @param playerId
     * @returns {boolean}
     */
    hasPlayer( playerId ) {
        return !!this.players[playerId];
    },


    /**
     * Add a player to our game
     *
     * @param player
     * @returns {Promise<void>}
     */
    async addPlayer( player ){
        if( !player ) return;

        // add the player's ID to our socket and set the player data
        this.addPlayerIdToSocketMap( player.socketId, player.id );
        this.addPlayerDataToPlayers( player );

        // set our game ID the player's gameID prop
        player.gameId = player.data.gameId = this.id;


        // if our game is still waiting to begin emit this game data to the lobby
        if( this.data.state === 'open' ){
            Server.io.to( 'lobby' ).emit( 'openGame', this.data );
            return;
        }

        // if this game state is not loading have this player join our game room
        // and push our game data to each player
        if( this.data.state !== 'loading' ) {
            player.joinRoom( this.data.id );
            await this.pushGameDataToPlayers( player );
        }
    },


    /**
     * Remove a player from this game
     *
     * @param player
     */
    removePlayer( player ){
        this.deleteSocketId( player.socketId );
        delete this.players[ player.id ];
        delete this.data.players[ player.id ];

        Server.io.to( 'lobby' ).emit( 'openGame', this.data );
    },



    /**
     * Set the properties of all players to the values provided
     *
     * @param obj
     */
    setPropsForAllPlayers( obj ){
        _.forEach( obj, (value, prop) => {
            _.forEach( this.players, ( player, id ) => {
                player.data[ prop ] = value;
            });
        });
    },


    /**
     * Have all of our players passed?
     *
     * @returns {boolean}
     */
    allPlayersHavePassed(){
        return Object.values( this.players ).every( player => player.data.passed );
    },


    /**
     * Set all players to active
     */
    setAllPlayersActive(){
        Object.values( this.players ).forEach( player => player.data.active = true );
    },


    /**
     * Are all players inactive?
     *
     * @returns {boolean}
     */
    allPlayersAreInactive(){
        return Object.values( this.players ).every( player => !player.data.active );
    },


    /**
     * Set one player to active
     *
     * @param player
     */
    setOnePlayerActive( player ){
        // if we pass an ID use it, otherwise get it from the player object
        let playerId = typeof player === 'string' ? player : player.id;
        _.forEach( this.players, ( player, id ) => {
            player.data.active = playerId === id;
        });
    },


    /**
     * Get the current player's faction name
     *
     * @returns {string}
     */
    currentPlayerFactionName(){
        return this.getPlayerFaction( this.currentPlayer() ).name;
    },


    /**
     * Returns the current player by active player index
     *
     * @returns {Player}
     */
    currentPlayer(){
        return this.players[ this.data.playerOrder[this.data.activePlayerIndex] ];
    },


    /**
     * Advance the game to the the next player
     *
     * @param listener
     * @param advance
     */
    async advancePlayer( listener, advance = true ){
        // should we move to the next active player?
        // this will usually be true except in the rare cases where a special faction action forces that player to
        // take an additional action afterwards, such as the witches magick, or ghosts materialize
        if( advance ) this.advanceActivePlayer();

        this.setActivePlayerListener( listener );
        this.data.gameAction++;

        Server.saveToDB( this );
        this.setTimeout();

        await this.pushGameDataToPlayers();
    },


    /**
     * Advance the active player according to our player order, skipping any passed players
     */
    advanceActivePlayer(){
        let currentIndex = this.data.activePlayerIndex;
        let newIndex = null;

        // find the next player who hasn't passed
        while( newIndex === null ){
            currentIndex++;

            // if our index exceeds our player count, cycle back to 0
            if( currentIndex > this.data.playerOrder.length - 1 ){
                currentIndex = 0;
            }

            // if the player with the current player index hasn't passed, then we have our player
            // otherwise continue the loop until
            if( !this.getPlayerByIndex( currentIndex ).data.passed ){
                newIndex = currentIndex;
            }
        }

        this.data.activePlayerIndex = newIndex;
        this.setActivePlayerByActivePlayerIndex();
    },


    /**
     * Given a player order index value, return the matching player
     *
     * @param index // this.data.playerOrder index
     * @returns {Player}
     */
    getPlayerByIndex( index ){
        return this.players[ this.data.playerOrder[ index ] ];
    },


    /**
     * Given a faction return that faction's player instance
     *
     * @param faction
     * @returns {Player}
     */
    getPlayerByFaction( faction ){
        if( typeof faction !== 'string' ) faction = faction.name;
        return this.players[ this.factions[ faction ].data.owner ];
    },


    /**
     * Use the active player index to set the matching player active
     */
    setActivePlayerByActivePlayerIndex(){
        this.setOnePlayerActive( this.data.playerOrder[ this.data.activePlayerIndex ] );
    },


    /**
     * Use the player order to set the first player active
     */
    setActivePlayerByPlayerOrder(){
        this.data.activePlayerIndex = 0;
        this.setOnePlayerActive( this.data.playerOrder[ 0 ] );
    },


    /**
     * Clear each player's current prompt
     */
    clearAllPrompts(){
        Object.values( this.players ).forEach( player => player.setPrompt({ active : false }) );
    },


    /**
     * Set the listener/prompt for the active player
     *
     * @param listener
     */
    setActivePlayerListener( listener = {} ){
        // clone the listener
        listener = Object.assign( {},  listener );

        // if the listener has a name use it, otherwise use our default listener, and barring that this phase name
        listener.name = listener.name || this.defaultListener || this.data.phase;

        // get our active player and set their listener / prompt
        let player = Object.values( this.players ).find( player => this.isPlayerActiveByPlayerOrder( player ) );
        listener.players = player;
        this.listen( listener );
    },


    /**
     * Determines if a given player is the active player by player order
     *
     * @param player
     * @returns {boolean}
     */
    isPlayerActiveByPlayerOrder( player ){
        return player.id === this.data.playerOrder[ this.data.activePlayerIndex ];
    },


    /**
     * Add the given player data into our players object
     *
     * @param player
     */
    addPlayerDataToPlayers( player ){
        // if our player object already has an entry for the given player, update our player object properties
        // with the old data, except the socketID property, as that changes each time the player connects/disconnects
        if( !this.players[ player.id ] ) {
            let oldPlayer = this.players[player.id];
            for (let prop in oldPlayer) {
                if (prop !== 'socketId') {
                    player[prop] = oldPlayer[prop];
                }
            }
        }

        this.players[ player.id ] = player;
        this.data.players[ player.id ] = player.data;
    },


    /**
     * Add player ID to our socketmap
     *
     * @param socketId
     * @param playerId
     */
    addPlayerIdToSocketMap( socketId, playerId ){ // map a socket id to a player id
        this.socketMap[socketId] = playerId;
    },


    /**
     * Use a player ID to return a matching socketID
     *
     * @param playerId
     * @returns {*}
     */
    getSocketIdByPlayerId( playerId ){
        let socketID = null;
        _.forEach( this.socketMap, (player, socket) => {
            if( player === playerId ){
                socketID = socket;
            }
        });

        return socketID;
    },


    /**
     * Return a Player instance matching a given player ID
     *
     * @param playerId
     * @returns {Player}
     */
    getPlayerById( playerId ){
        let socket = this.getSocketIdByPlayerId( playerId );
        return Server.getPlayer( socket );
    },


    /**
     * Delete a socketID from our socketmap
     *
     * @param socketId
     */
    deleteSocketId( socketId ){
        // remove a socket id/player id mapping
        delete this.socketMap[socketId];
    },


    /**
     * Returns a player's faction instance
     *
     * @param player
     * @returns {Faction}
     */
    getPlayerFaction( player ){
        return this.factions[ player.data.faction ];
    },


    /**
     * Alias method for addPlayer
     *
     * @param player
     */
    joinGame( player ){
        this.addPlayer( player );
    },


    /**
     * Alias method for removePlayer
     *
     * @param player
     */
    leaveGame( player ){
        this.removePlayer( player );
    },


    /**
     * Send a bribe from one player to another
     *
     * @param player
     * @param recipient
     * @param bribe
     */
    async sendBribe( player, recipient, bribe ){
        //remove the resources from the giver
        player.faction().data.resources -= bribe;
        // grant them to the recipient
        this.factions[recipient].gainResources( bribe );

        // format our message icons
        let icons = Array( bribe ).fill('xRx' ).join('');
        this.message({ message: `bribed ${this.getPlayerByFaction( recipient ).data.name} with ${icons}`, faction : player.faction() });

        // push the updated resource count to all players
        await this.updateResources();
    },


    /**
     * Manually adjust the value a player's AP,PP,Resources, or Energy
     *
     * @param player
     * @param data
     */
    async setPoints( player, data ){
        let pointsTypeText = data.type;

        switch( data.type ){
            case 'ap':
                pointsTypeText = 'Area Points';
                this.factions[data.faction].gainAP( data.val );
                await this.updatePoints();
                break;
            case 'pp':
                pointsTypeText = 'Area Points';
                this.factions[data.faction].gainPP( data.val );
                await this.updatePoints();
                break;
            case 'energy':
                this.factions[data.faction].data.energy += data.val;
                await this.updateResources();
                break;
            case 'resources':
                this.factions[data.faction].data.resources += data.val;
                await this.updateResources();
                break;
        }

        this.message({ message: `manually adjusted the ${data.faction} ${pointsTypeText} (${data.val})`, class: 'warning', player : player });
        await this.updatePoints();
    },
};

module.exports = mixin;
