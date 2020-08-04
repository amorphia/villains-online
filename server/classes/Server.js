const Player = require( "./Player" );
const Game = require( "./Game" );
const DB = require( "./DB");


class Server {

    debug = false;
    messageNum = 0;
    //savedGames;
    games = {};
    players = {};
    lobbyPlayers = {};
    playerSocketMap = {};

    constructor( server, io ) {
        this.db = new DB();
        this.io = io;
        this.server = server;
        //this.db.createTables();
        //this.loadSavesFromDB();
        this.initPlayerConnections();
    }

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

            // load last game
            socket.on( 'loadGame', game => { this.loadGame( game ) } );

            // conclude a finished (or not) game
            socket.on( 'concludeGame', () => { this.concludeGame( socket ) } );

            // manually save game
            socket.on( 'saveGame', gameId => { this.saveGame( socket, gameId ) } );

            Game.initEvents( socket );
        });
    }

    saveToDB( game, options ) {
        this.db.save( game, options );
    }

    /*
    async loadSavesFromDB( options ){
        this.savedGames = await this.db.load( options );
    }
    */

    closeOpenGame(){
        this.io.to( 'lobby' ).emit( 'openGame', null );
    }

    getPlayer( socket ){
        if( typeof socket === 'object' ){
            socket = socket.id;
        }
        return this.players[ this.playerSocketMap[socket] ];
    }


    concludeGame( socket ){
        this.getPlayer( socket ).game().conclude( socket );
    }

    concludeDBGame( game ) {
        this.db.conclude( game );
    }

    getOpenGame(){
        for( let game in this.games ){
            if( this.games[ game ].isOpen() ){
                return this.games[ game ].data;
            }
        }
    }

    saveNewGame( game ){
        console.log( 'saveNewGame' );
        this.db.create( game );
    }

    saveGame( socket, gameId ){
        let game = this.games[gameId];
        this.saveToDB( game,{ type : 'manual' });
        game.message( 'Game Saved' );
    }


    async loadGame( save ){
        this.message( 'lobby', { message : 'loading saved game' });
        let saved = await this.db.load( save );
        let game = new Game( saved );
        this.games[game.id] = game;
        game.loadSavedGame( saved );
    }


    createGame( socket ){
        let game = new Game();
        this.games[game.id] = game;
        let player = this.getPlayer( socket );
        this.message( 'lobby', { message: 'created game', player : player });
        this.io.to('lobby').emit( 'openGame', game.data );
    }


    deleteGame( socket, gameId ){

        if( this.games[gameId].isOpen() ){
            this.io.to('lobby').emit( 'openGame', null );
            let player = this.getPlayer( socket );
            this.message( 'lobby', { message: 'deleted game', player: player });
        }

        this.db.conclude( gameId );
        delete this.games[gameId];
    }

    sound( sound, options = {} ){
        let player;

        if( options.player ){
            if( typeof options.player === 'string' ){
                player = this.players[options.player];
            } else {
                player = options.player;
            }

            //player.socket().emit( 'sound', sound, options );
            player.callSocket( 'emit', 'sound', sound, options );
        } else {
            this.io.to( options.room ).emit( 'sound', sound, options );
        }
    }

    messagePlayer( player, message ){
        if( typeof message === 'string' ) message = { 'message' : message };
        message.timestamp = this.messageNum++;

        if( typeof player === 'string' ){
            player = this.players[player];
        }

        //player.socket().emit( 'message', message );
        player.callSocket( 'emit', 'message', message );
    }

    message( room, message ){
        if( typeof message === 'string' ) message = { 'message' : message };
        message.timestamp = this.messageNum++;

        if( typeof message.player === 'string' ){
            message.player = this.players[message.player];
        }

        if( message.faction && typeof message.faction !== 'string' ){
            message.faction = message.faction.name;
        }

        this.io.to( room ).emit( 'message', message );
    }

    popup( player, room, popup ){
        if( typeof player === 'string' ) player = this.players[player];
        //player.socket().to( room ).emit( 'popup', popup  );
        player.emitToOthers( room, 'popup', popup );
    }

    removePlayer( socket ) {
        let player =  this.getPlayer( socket );
        if( !player ) return;

        let room = player.room;
        if( room && this.games[room] ){ // if they are in a game
            this.games[room].deleteSocketId( socket.id );
        }

        if( room === 'lobby' ){
            this.updateLobbyPopulation( player, false );
        }

        this.message( room, { message: 'disconnected', player: player, class: 'warning' });

        delete this.players[ this.playerSocketMap[socket.id] ];
        delete this.playerSocketMap[socket.id]
    }


    sendSocketOpenGame( socket ){
        socket.emit( 'openGame', this.getOpenGame() );
    }

    addPlayer( socket, data ) {

        let player = new Player( socket, data );
        this.players[player.id] = player;
        this.playerSocketMap[ socket.id ] = player.id;

        let gameId = this.searchGamesForPlayer( player );
        if( gameId ) {
            this.games[gameId].addPlayer( player );
        } else {
            this.sendSocketOpenGame( socket );

        }

        console.log( `${player.data.name} connected` );
    }

    updateLobbyPopulation( player, joining ){
        if( joining ){
            this.lobbyPlayers[player.id] = player.data.name;
        } else {
            delete this.lobbyPlayers[player.id];
        }
        this.io.to( 'lobby' ).emit( 'lobbyPlayers', this.lobbyPlayers );
    }

    searchGamesForPlayer( player ){
        for( let gameId in this.games ){
            if( this.games[gameId].hasPlayer( player.data.id ) ){
                return gameId;
            }
        }
    }
}



module.exports = ( server, io ) => {
    return new Server( server, io  );
};
