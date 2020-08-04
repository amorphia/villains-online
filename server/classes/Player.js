class Player {

    socketId;
    debug = false;
    id;
    room;
    gameId;
    listeners = {};

    data = {
        id : null,
        name : null,
        index : null,
        passed : false,
        active : null,
        faction : null,
        gameId : null,
        prompt : {
            name : null,
            data : null
        },

    };

    clearGameData(){
        this.gameId = null;
        this.listeners = {};

        this.data.index  = null;
        this.data.passed = false;
        this.data.active = null;
        this.data.faction = null;
        this.data.gameId = null;
        this.data.prompt = {
            name : null,
            data : null
        };

        // this.socket().emit( 'clearGame' );
        this.callSocket( 'emit', 'clearGame' );
        this.joinRoom( 'lobby' );
        Server.sendSocketOpenGame( this.socket() );

    }

    listen( args ){
        this.listeners[args.name] = {
            callback : args.callback,
            persist : args.persist
        };
        this.setPrompt( args );
    }

    removeListener( name, removePrompt = true ){
        delete this.listeners[name];
        if( removePrompt ) this.setPrompt({ active : false });
    }

    setPrompt( prompt ){
        if( typeof prompt === 'string' ){
            prompt = { name : prompt };
        }

        this.data.prompt.name = prompt.name ? prompt.name : null;
        this.data.prompt.data = prompt.data ? prompt.data : null;
        this.data.active = prompt.hasOwnProperty( 'active' ) ? prompt.active : true; // if we don't set the active flag, assume true

        if( prompt.update ){
            this.game().updateAll();
        }

        if( prompt.playerUpdate ){
            this.game().updatePlayerData();
        }
    }

    game(){
        return Server.games[this.gameId];
    }

    faction(){
        return Server.games[this.gameId].factions[ this.data.faction ];
    }

    constructor( socket, {name, id} ) {
        this.socketId = socket.id;
        this.data.name = name;
        this.id = this.data.id = id;
        this.joinRoom('lobby' );
    }

    joinRoom( room ) {
        //this.socket().leaveAll();
        this.callSocket( 'leaveAll' );

        let oldRoom = this.room;
        this.room = room;

        //this.socket().join( room );
        this.callSocket( 'join', room );

        let roomName = room === 'lobby' ? 'lobby' : 'game';
        Server.message( this.room, { message: `joined ${roomName}`, player : this });

        if( roomName === 'lobby' ){
            Server.updateLobbyPopulation( this, true );
        } else if( oldRoom === 'lobby' ) {
            Server.updateLobbyPopulation( this, false );
        }
    }


    emitToOthers( room, emit, ...args ){
        let socket = this.socket();
        if( socket ){
            socket.to( room ).emit( emit, ...args );
        }
    }


    callSocket( func, ...args ){
        let socket = this.socket();
        if( socket ){
            socket[func]( ...args );
        } else {
            console.log( 'No Socket present' );
        }
    }


    socket(){
        return Server.io.sockets.connected[this.socketId];
    }
}



module.exports = Player;
