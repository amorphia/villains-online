const Player = require( "./Player" );
const Game = require( "./Game" );
const DB = require( "./DB");


class Server {

    debug = false; // set debug mode
    gameTimeout = 60 * 60 * 1000 ; // an hour
    messageNum = 0; // used to stamp messages with unique incrementing IDs
    games = {}; // object map for our active games
    players = {}; // object map for our connected players
    lobbyPlayers = {}; // players hanging out in the lobby
    playerSocketMap = {}; // mapping of each player to their websocket ID
    gameTimeouts = {}; // mapping used to manage each active games timeout counters


    constructor( server, io ) {
        this.db = new DB();
        this.io = io;
        this.server = server;
        this.initPlayerConnections();
    }


    /**
     * Initialize a player when they connect via websockets and setup our basic
     * game server management events for that player
     */
    initPlayerConnections() {

        this.io.on( 'connection', socket => {
            console.log( 'Connection:', socket.id );

            // add authorized players to players store
            socket.on( 'newPlayer', data => this.addPlayer( socket, data ) );

            // handle disconnected players
            socket.on( 'disconnect', () => this.removePlayer( socket ) );

            // generate new game
            socket.on( 'newGame', () => this.createGame( socket ) );

            // delete a game
            socket.on( 'deleteGame', gameId => this.deleteGame( socket, gameId ) );

            // set game type
            socket.on( 'setGameType', (gameId, type) => this.setGameType( socket, gameId, type ) );

            // load last game
            socket.on( 'loadGame', game => { this.loadGame( game ) } );

            socket.on( 'watchGame', gameId => { this.watchGame( socket, gameId ) } );

            socket.on( 'stopWatchingGame', gameId =>{ this.stopWatchingGame( socket, gameId ) } );

            // conclude a finished (or not) game
            socket.on( 'concludeGame', track => { this.concludeGame( socket, track ) } );

            // manually save game
            socket.on( 'saveGame', gameId => { this.saveGame( socket, gameId ) } );

            // run static initEvents function to setup universal game events handler
            Game.initEvents( socket );
        });
    }


    /**
     * Begin listening to a port
     *
     * @param {number} port
     */
    listen( port ){
        this.server.listen( port );
    }

    /**
     * Save a game to the database
     *
     * @param game // a game object
     * @param options // any additional options
     */
    saveToDB( game, options ) {
        this.db.save( game, options );
    }


    /**
     * Record the results of a completed game to our external record tracker
     *
     * @param game // game object
     * @param scores // game score results
     * @param incomplete // was this a completed game?
     */
    saveToTracker( game, scores, incomplete ) {
        this.db.track( game, scores, incomplete );
    }


    /**
     * Close any currently open game waiting to begin in the lobby
     */
    closeOpenGame(){
        this.io.to( 'lobby' ).emit( 'openGame', null );
    }


    /**
     * Given a socket object, or a socket ID, return the associated player
     *
     * @param {Socket|string} socket
     * @returns {Player} player
     */
    getPlayer( socket ){
        if( socket !== null && typeof socket === 'object' ){
            socket = socket.id;
        }
        return this.players[ this.playerSocketMap[socket] ];
    }


    /**
     * Manually conclude a game in progress
     *
     * @param {Socket|string} socket
     * @param {boolean} track // should we track the results of this game in our external results recorder?
     */
    concludeGame( socket, track ){

        // get the game this player is currently in
        let game = this.getPlayer( socket ).game();

        // if we want to track the results of this game go to final scoring
        if( track ) {
            game.scoreGame( true );
            return
        }

        // otherwise just jump to concluding the game
        game.conclude( socket );
    }


    /**
     * Flag a game a concluded in the save state database
     *
     * @param {Game} game
     */
    concludeDBGame( game ) {
        this.db.conclude( game );
    }


    /**
     * If there is a currently open game waiting to begin, return it's game data
     *
     * @returns {object} // Game.data
     */
    getOpenGameData(){
        for( let game in this.games ){
            if( this.games[ game ].isOpen() ){
                return this.games[ game ].data;
            }
        }
    }

    getActiveGames(){
        const games = [];

        Object.keys(this.games)
            .filter( gameId => this.games[gameId].started)
            .forEach( gameId => {
                const game = this.games[gameId];
                games.push({
                    id: gameId,
                    created: game.created,
                    players: Object.values(game.players).map(player => player.data.name),
                });
            })

        console.log("GetActiveGames", games);
        return games;
    }

    /**
     * Save a new game instance in the database
     *
     * @param {Game} game
     */
    saveNewGame( game ){
        console.log( 'saveNewGame' );
        this.db.create( game );
    }


    /**
     * Save the current game state to the database
     *
     * @param socket
     * @param {string} gameId
     */
    saveGame( socket, gameId ){
        let game = this.games[gameId];
        this.saveToDB( game,{ type : 'manual' });
        game.message( 'Game Saved' );
    }


    /**
     * Load a game save state from the database
     *
     * @param {string} save // ID of a saved game
     */
    async loadGame( save ){

        this.message( 'lobby', { message : 'loading saved game' });

        // get the game data from the database
        let saved = await this.db.load( save ).catch( error => console.error( error ) );

        // hydrate the game data into a full game object
        let game = new Game( saved );

        // add the game to our active games object
        this.games[game.id] = game;

        // let the game finish booting itself up
        game.loadSavedGame( saved );
    }


    /**
     * Create a new game
     *
     * @param socket
     */
    createGame( socket ){
        // construct a new Game object
        let game = new Game();

        // add the game to our active games object
        this.games[game.id] = game;

        // flag the socket that sent this command as the game's creator
        let player = this.getPlayer( socket );
        game.data.creator = player.id;

        // if the player creating the game is not an admin, gameType defaults to basic

        console.log("player", player);

        if(!player.data.admin){
            game.data.gameType = "basic";
        }

        // push the game data to the lobby
        this.message( 'lobby', { message: 'created game', player : player });
        this.io.to('lobby').emit( 'openGame', game.data );
    }

    /**
     * Set (or reset) a given game's timeout counter, if the timer reaches the end the game concludes
     *
     * @param {string} gameId
     */
    setTimeout( gameId ){
        if( this.gameTimeouts[gameId] ) clearTimeout( this.gameTimeouts[gameId] );
        this.gameTimeouts[gameId] = setTimeout( () => {
            let game = this.games[gameId];
            if( game ) game.conclude( null, true );
        }, this.gameTimeout );
    }


    /**
     * Delete a game
     *
     * @param socket
     * @param {string} gameId
     */
    deleteGame( socket, gameId ){
        if( this.games[gameId].isOpen() ){
            this.io.to('lobby').emit( 'openGame', null );

            if( socket ) {
                let player = this.getPlayer( socket );
                this.message( 'lobby', { message: 'deleted game', player: player });
            }
        }

        this.db.conclude( gameId );
        delete this.games[gameId];

        this.io.to('lobby').emit( 'activeGames', this.getActiveGames() );
    }


    /**
     * Set a given game's type, such as basic|optimized|anarchy
     *
     * @param socket
     * @param gameId
     * @param {string} type
     */
    setGameType( socket, gameId, type ){

        let game = this.games[gameId];

        if( game.isOpen() ) {
            game.data.gameType = type;
            this.io.to( 'lobby' ).emit( 'openGame', game.data );
        }
    }

    /**
     * Play a sound to either a room or a player
     *
     * @param sound
     * @param options
     */
    sound( sound, options = {} ){
        // if we aren't given a room or a player, then abort
        if( options.room == null && options.player == null ) return;

        // if we are given a player in our options then send the sound directly to that player
        if( options.player != null ){
            this.sendSoundToPlayer( sound, options );
            return;
        }

        // otherwise emit the sound to the given room
        this.io.to( options.room ).emit( 'sound', sound, options );
    }


    /**
     * Emit a sound to a specific player
     *
     * @param sound
     * @param options
     */
    sendSoundToPlayer( sound, options ){
        let player = options.player;

        // if we are passed a player id string instead of a player object, grab the player object
        // from our players map. If we don't have a matching player in our players map abort
        if( typeof player === 'string') player = this.players[options.player];
        if( !player ) return;

        player.callSocket( 'emit', 'sound', sound, options );
    }


    /**
     * Send a message to a specific player
     *
     * @param player
     * @param message
     */
    messagePlayer( player, message ){

        // prep our message object
        message = this.prepareMessageObject( message );

        // if provided a player id string instead of a player object, grab the player object from the players map
        if( typeof player === 'string' ){
            player = this.players[player];

            // if we didn't find a matching player in the map, abort
            if( !player ) return;
        }

        player.callSocket( 'emit', 'message', message );
    }


    /**
     * create a message object from the supplied message if we need to, and set its id/timestamp
     *
     * @param message
     * @returns {{message: *}}
     */
    prepareMessageObject( message ){
        if( typeof message === 'string' ) message = { 'message' : message };
        message.timestamp = this.messageNum++;

        return message;
    }


    /**
     * Send a message to a room
     *
     * @param room
     * @param message
     */
    message( room, message ){

        // prep our message object
        message = this.prepareMessageObject( message );

        // if we are given a player ID string as our player, replace it with the matching player object
        if( typeof message.player === 'string' ){
            message.player = this.players[message.player];
        }

        // if we are passed a whole faction object as the faction, replace it with just the faction's name
        // as that's all we need
        if( message.faction && typeof message.faction !== 'string' ){
            message.faction = message.faction.name;
        }

        // emit the message
        this.io.to( room ).emit( 'message', message );
    }


    /**
     * Send a player action popup to each of that player's opponents
     *
     * @param player
     * @param room
     * @param popup
     */
    popup( player, room, popup ){
        if( typeof player === 'string' ) player = this.players[player];
        player.emitToOthers( room, 'popup', popup );
    }


    /**
     * Remove a player
     *
     * @param socket
     */
    removePlayer( socket ) {
        let player =  this.getPlayer( socket );
        if( !player ) return;

        let room = player.room;

        // if they are in a game tell that game to remove their socket ID
        if( room && this.games[room] ){
            this.games[room].deleteSocketId( socket.id );
        }

        // if they are in the lobby, update the lobby population
        if( room === 'lobby' ){
            this.updateLobbyPopulation( player, false );
        }

        // let the lobby know the player has disconnected
        this.message( room, { message: 'disconnected', player: player, class: 'warning' });

        // remove this player from the players object
        delete this.players[ this.playerSocketMap[socket.id] ];

        // clear this player from the socketmap
        delete this.playerSocketMap[socket.id]
    }


    /**
     * Send a specific player socket the current open game data
     *
     * @param socket
     */
    sendSocketOpenGame( socket ) {
        if ( socket ){
            console.log("Sending socket Open and Active Game data");
            socket.emit( 'openGame', this.getOpenGameData() );
            socket.emit( 'activeGames', this.getActiveGames() );
        }
    }


    /**
     * Add a player when a socket connects
     *
     * @param socket
     * @param data
     */
    addPlayer( socket, data ) {

        // construct a new player object
        let player = new Player( socket, data );
        console.log( `${player.data.name} connected` );

        // add this player to our player map
        this.players[player.id] = player;

        // update our socketmap
        this.playerSocketMap[ socket.id ] = player.id;

        // check if this player is currently in a game, if so add them back into that game
        let gameId = this.searchGamesForPlayer( player );
        if( gameId ) {
            this.games[gameId].addPlayer( player );
            return;
        }

        // check if this player is currently in a game, if so add them back into that game
        gameId = this.searchGamesForSpectator( player );
        if( gameId ) {
            this.games[gameId].addSpectator( player );
            return;
        }

        this.sendSocketOpenGame( socket );
    }


    async watchGame( socket, gameId ){
        let player = this.players[this.playerSocketMap[ socket.id ]];
        this.games[gameId].addSpectator( player );
    }

    async stopWatchingGame( socket, gameId ){
        let player = this.players[this.playerSocketMap[ socket.id ]];
        this.games[gameId].removeSpectator( player );
    }

    /**
     * Update the lobby population by either adding or removing the supplied player
     *
     * @param {Player} player
     * @param {boolean} joining
     */
    updateLobbyPopulation( player, joining = false ){
        // add or remove this player from the lobby player's object
        if( joining ){
            this.lobbyPlayers[player.id] = player.data;
        } else {
            delete this.lobbyPlayers[player.id];
        }

        // emit the lobby players object
        this.io.to( 'lobby' ).emit( 'lobbyPlayers', this.lobbyPlayers );
    }


    /**
     * Check to see if the given player is playing in any of our active games, and if so return that game ID
     *
     * @param player
     * @returns {string}
     */
    searchGamesForPlayer( player ){
        for( let gameId in this.games ){
            if( this.games[gameId].hasPlayer( player.data.id ) ){
                return gameId;
            }
        }
    }

    searchGamesForSpectator( player ){
        for( let gameId in this.games ){
            if( this.games[gameId].hasSpectator( player.data.id ) ){
                return gameId;
            }
        }
    }
}



module.exports = ( server, io ) => {
    return new Server( server, io  );
};
