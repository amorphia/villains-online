let mixin = {

    sendBribe( player, recipient, bribe ){
        player.faction().data.resources -= bribe;
        this.factions[recipient].gainResources( bribe );
        let icons = Array( bribe ).fill('xRx' ).join('');
        this.message({ message: `bribed ${this.getPlayerByFaction( recipient ).data.name} with ${icons}`, faction : player.faction() });
        this.updateResources();
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

    currentPlayer(){
        return this.players[ this.data.playerOrder[this.data.activeIndex] ];
    },

    clearAllPlayerPrompts(){
        _.forEach( this.players, player => player.setPrompt({ active : false }) );
    },

    clearPlayerPrompt( player ){
        player.setPrompt({ active : false });
        this.updateAll();
    },

    advancePlayer( listener ){
        this.advanceActivePlayer();
        this.setActivePlayerListener( listener );
        Server.saveToDB( this );
        this.updateAll();
    },

    resetToFirstPlayer(){
        // this.data.activeIndex = this.firstPlayer;
        // this.setOnePlayerActive( this.data.playerOrder[ this.firstPlayer ] );
        this.data.activeIndex = 0;
        this.setOnePlayerActive( this.data.playerOrder[0] );
    },

    advanceActivePlayer(){
        let currentIndex = this.data.activeIndex;
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

        this.data.activeIndex = newIndex;
        this.setActivePlayerByActiveIndex();
    },

    getPlayerByIndex( index ){
        return this.players[ this.data.playerOrder[ index ] ];
    },

    getPlayerByFaction( faction ){
        if( typeof faction !== 'string' ) faction = faction.name;
        return this.players[ this.factions[ faction ].data.owner ];
    },

    setActivePlayerByActiveIndex(){
        this.setOnePlayerActive( this.data.playerOrder[ this.data.activeIndex ] );
    },

    setActivePlayerByPlayerOrder(){
        this.data.activeIndex = 0;
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
            if( player.id === this.data.playerOrder[ this.data.activeIndex ]  ){
                listener.players = player;
                this.listen( listener );
            }
        });
    },

    setActivePlayerPrompt( prompt, data ){
        _.forEach( this.players, player => {
            if( player.id === this.data.playerOrder[ this.data.activeIndex ]  ){
                player.setPrompt({
                    name : prompt,
                    data : data
                });
            } else {
                player.setPrompt({ active : false });
            }
        });
    },

    addPlayer( player ){
        if( !player ) return;

        this.addPlayerId( player.socketId, player.id );
        this.setPlayerData( player );
        player.gameId = player.data.gameId = this.id;

        if( this.data.state === 'open' ){
            Server.io.to( 'lobby' ).emit( 'openGame', this.data );
        } else if( this.data.state !== 'loading' ) {
            player.joinRoom( this.data.id );
            this.updateAll();
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
