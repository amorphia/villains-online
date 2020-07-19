const Player = require( "./Player" );
const Game = require( "./Game" );
const DB = require( "./DB");


class Server {

    debug = false;
    messageNum = 0;
    savedGames;
    games = {};
    players = {};
    playerSocketMap = {};

    constructor( server, io ) {
        this.db = new DB();
        this.io = io;
        this.server = server;
        this.db.createTables();
        this.loadSavesFromDB();
        this.initPlayerConnections();
    }

    initPlayerConnections() {

        this.io.on( 'connection', socket => {
            if( this.debug ) console.log( 'Connection:', socket.id );

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

            // load last game
            socket.on( 'saveGame', gameId => { this.saveGame( socket, gameId ) } );

            Game.initEvents( socket );
        });
    }

    saveToDB( game, options ) {
        this.db.save( game, options );
    }

    async loadSavesFromDB( options ){
        this.savedGames = await this.db.load( options );
    }

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

    getOpenGame(){
        for( let game in this.games ){
            if( this.games[ game ].isOpen() ){
                return this.games[ game ].data;
            }
        }
    }

    saveGame( socket, gameId ){
        let game = this.games[gameId];
        this.saveToDB( game,{ type : 'manual' });
        game.message( 'Game Saved' );
    }

    loadGame( gameId ){
        this.message( 'lobby', { message : 'loading saved game' });
        let saved = _.find( this.savedGames, save => save['game_id'] === gameId );
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

            player.socket().emit( 'sound', sound, options );
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

        player.socket().emit( 'message', message );
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

    removePlayer( socket ) {
        let player =  this.getPlayer( socket );
        if( !player ) return;

        let room = player.room;
        if( room && this.games[room] ){ // if they are in a game
            this.games[room].deleteSocketId( socket.id );
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
            if( this.savedGames ) socket.emit( 'savedGames', this.getSavedGameList() );
        }

        if( this.debug ) console.log( `${player.data.name} connected` );
    }

    getSavedGameList(){
        let games = [];
        _.forEach( this.savedGames, save => {
            let item = _.clone( save );
            delete item.data;
            games.push( item );
        });

        return games;
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
