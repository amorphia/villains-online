let mixin = {

    /**
     *
     * @param player
     */
    joinGame( player ){
        this.addPlayer( player );
    },


    /**
     *
     * @param player
     */
    leaveGame( player ){
        this.removePlayer( player );
    },

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

    async sendBribe( player, recipient, bribe ){
        player.faction().data.resources -= bribe;
        this.factions[recipient].gainResources( bribe );
        let icons = Array( bribe ).fill('xRx' ).join('');
        this.message({ message: `bribed ${this.getPlayerByFaction( recipient ).data.name} with ${icons}`, faction : player.faction() });
        await this.updateResources();
    },

    hasPlayer( playerId ) {
        return !!this.players[playerId];
    },

    clearFactionMessages(){
       _.each( this.factions, ( faction, id ) => {
            faction.data.message = '';
       });
    },

    removePlayer( player ){
        this.deleteSocketId( player.socketId );
        delete this.players[ player.id ];
        delete this.data.players[ player.id ];

        Server.io.to( 'lobby' ).emit( 'openGame', this.data );
    },

    allFactions( obj ){
        _.forEach( obj, (value, prop) => {
            _.forEach( this.data.factions, ( faction, name ) => {
                faction[ prop ] = value;
            });
        });
    },

    allAreas( obj ){
        _.forEach( obj, (value, prop) => {
            _.forEach( this.data.areas, ( area, name ) => {
                area[ prop ] = value;
            });
        });
    },

    allPlayers( obj ){
        _.forEach( obj, (value, prop) => {
            _.forEach( this.players, ( player, id ) => {
                player.data[ prop ] = value;
            });
        });
    },

    allPlayersHavePassed(){
        let allPassed = true;
        _.forEach( this.players, ( player, id ) => {
            if( ! player.data.passed ) allPassed = false;
        });
        return allPassed;
    },

    setAllPlayersActive(){
        _.forEach( this.players, ( player, id ) => {
            player.data.active = true;
        });
    },

    allPlayersInactive(){
        let allInactive = true;
        _.forEach( this.players, ( player, id ) => {
            if( player.data.active === true ) allInactive = false;
        });
        return allInactive;
    },

    setOnePlayerActive( player ){
        // if we pass an ID use it, otherwise get it from the player object
        let playerId = typeof player === 'string' ? player : player.id;
        _.forEach( this.players, ( player, id ) => {
            player.data.active = playerId === id;
        });
    },

    currentPlayerFactionName(){
        return this.getPlayerFaction( this.currentPlayer() ).name;
    },

    currentPlayer(){
        return this.players[ this.data.playerOrder[this.data.activePlayerIndex] ];
    },

    clearAllPlayerPrompts(){
        _.forEach( this.players, player => player.setPrompt({ active : false }) );
    },

    async clearPlayerPrompt( player ){
        player.setPrompt({ active : false });
        await this.pushGameDataToPlayers();
    },

    async advancePlayer( listener, advance = true ){
        if( advance ) this.advanceActivePlayer();
        this.setActivePlayerListener( listener );
        this.data.gameAction++;
        Server.saveToDB( this );
        this.setTimeout();
        await this.pushGameDataToPlayers();
    },

    resetToFirstPlayer(){
        // this.data.activePlayerIndex = this.firstPlayer;
        // this.setOnePlayerActive( this.data.playerOrder[ this.firstPlayer ] );
        this.data.activePlayerIndex = 0;
        this.setOnePlayerActive( this.data.playerOrder[0] );
    },

    advanceActivePlayer(){
        let currentIndex = this.data.activePlayerIndex;
        let newIndex = null;

        while( newIndex === null ){
            currentIndex++;
            if( currentIndex > this.data.playerOrder.length - 1 ){
                currentIndex = 0;
            }

            if( !this.getPlayerByIndex( currentIndex ).data.passed ){
                newIndex = currentIndex;
            }
        }

        this.data.activePlayerIndex = newIndex;
        this.setActivePlayerByactivePlayerIndex();
    },

    getPlayerByIndex( index ){
        return this.players[ this.data.playerOrder[ index ] ];
    },

    getPlayerByFaction( faction ){
        if( typeof faction !== 'string' ) faction = faction.name;
        return this.players[ this.factions[ faction ].data.owner ];
    },

    setActivePlayerByactivePlayerIndex(){
        this.setOnePlayerActive( this.data.playerOrder[ this.data.activePlayerIndex ] );
    },

    setActivePlayerByPlayerOrder(){
        this.data.activePlayerIndex = 0;
        this.setOnePlayerActive( this.data.playerOrder[ 0 ] );
    },

    clearAllPrompts(){
        _.forEach( this.players, player => {
            player.setPrompt({ active : false });
        });
    },

    setActivePlayerListener( listener = {} ){
        listener = Object.assign( {},  listener );
        listener.name = listener.name || this.defaultListener || this.data.phase;

        _.forEach( this.players, player => {
            if( player.id === this.data.playerOrder[ this.data.activePlayerIndex ]  ){
                listener.players = player;
                this.listen( listener );
            }
        });
    },

    setActivePlayerPrompt( prompt, data ){
        _.forEach( this.players, player => {
            if( player.id === this.data.playerOrder[ this.data.activePlayerIndex ]  ){
                player.setPrompt({
                    name : prompt,
                    data : data
                });
            } else {
                player.setPrompt({ active : false });
            }
        });
    },

    async addPlayer( player ){
        if( !player ) return;

        this.addPlayerId( player.socketId, player.id );
        this.setPlayerData( player );
        player.gameId = player.data.gameId = this.id;

        if( this.data.state === 'open' ){
            Server.io.to( 'lobby' ).emit( 'openGame', this.data );
        } else if( this.data.state !== 'loading' ) {
            player.joinRoom( this.data.id );
            await this.pushGameDataToPlayers( player );
        }
    },

    setPlayerData( player ){
        // if this is new player data add it
        if( !this.players[ player.id ] ){
            this.players[ player.id ] = player;
            this.data.players[ player.id ] = player.data;
        }
        // otherwise if they already exist just update object
        else {
            let oldPlayer = this.players[ player.id ];
            for( let prop in oldPlayer ){
                if( prop !== 'socketId' ){
                    player[ prop ] = oldPlayer[ prop ];
                }
            }
            this.players[ player.id ] = player;
            this.data.players[ player.id ] = player.data;
        }
    },


    addPlayerId( socketId, playerId ){ // map a socket id to a player id
        this.socketMap[socketId] = playerId;
    },

    getSocketIdByPlayerId( playerId ){
        let socket = null;
        _.forEach( this.socketMap, (value, prop) => {
            if( value === playerId ){
                socket = prop;
            }
        });

        return socket;
    },

    getPlayerById( playerId ){
        let socket = this.getSocketIdByPlayerId( playerId );
        return Server.getPlayer( socket );
    },

    getPlayerId( socketId ){
        return this.socketMap[socketId];
    },

    getPlayerBySocket( socketId ){ // returns the player corresponding to a specific *socket* ID
        return this.players[this.getPlayerId( socketId )];
    },

    deleteSocketId( socketId ){ // remove a socket id/player id mapping
        delete this.socketMap[socketId];
    },

    getPlayerFaction( player ){
        return this.factions[ player.data.faction ];
    }

};

module.exports = mixin;
