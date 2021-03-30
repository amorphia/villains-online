class Player {
    debug = false;

    socketId; // {string} the player's socket ID
    id; // {string} the player's UUID (generated when the account is created)
    room; // {string} the player's current room
    gameId; // {string} game ID of the player's current game
    listeners = {}; // map of websocket event listeners we are waiting on

    data = {
        id : null, // {string} the player's UUID (generated when the account is created)
        name : null, // {string} the player's name
        passed : false, // {boolean} has the player passed for this phase?
        active : false, // {boolean} is the game waiting for a response from this player?
        faction : null, // {string} this player's faction name
        gameId : null, // {string} game ID of the player's current game

        // when the player is active this object holds player's current UI prompt and its associated data
        prompt : {
            name : null,
            data : null
        },

    };


    constructor( socket, {name, id} ) {
        this.socketId = socket.id;
        this.data.name = name;
        this.id = this.data.id = id;
        this.joinRoom('lobby' );
    }


    /**
     * Leave the current game, and rejoin the game lobby
     */
    async leaveCurrentGame(){

        // reset game related data
        this.gameId = null;
        this.listeners = {};
        this.data.passed = false;
        this.data.active = null;
        this.data.faction = null;
        this.data.gameId = null;
        this.data.prompt = {
            name : null,
            data : null
        };

        // tell the game UI to clear out the current game
        this.callSocket( 'emit', 'clearGame' );

        // join the lobby and get the open game, if any
        this.joinRoom( 'lobby' );
        Server.sendSocketOpenGame( this.socket() );
    }


    /**
     * Set the player prompt and add a listener for the response
     *
     * @param {object} args
     *      {string} name // the name of the listener/prompt
     *      {object|string} callback // the callback function we should run when the player responds to this listener, can be a function or the name of a function
     *      {boolean} persist // should we keep this event listener even after the player responds? Used for repeatable actions like sending bribes
     *      {boolean} update // should we push the game data to all players
     *      {boolean} updatePlayerData // should we push the player data to all players
     */
    listen( args ){
        // add this listener to our listener map
        this.listeners[args.name] = {
            callback : args.callback,
            persist : args.persist
        };

        // set the player prompt UI
        this.setPrompt( args );
    }


    /**
     * Remove an event listener from this player
     *
     * @param {string} name // the name of the listener
     * @param {boolean} removePrompt // should we clear the player's current prompt on the UI end?
     */
    removeListener( name, removePrompt = true ){
        delete this.listeners[name];
        if( removePrompt ) this.setPrompt({ active : false });
    }


    /**
     * Send the user a UI prompt to allow them to respond to an event listener
     *
     * @param {object|string} prompt
     */
    async setPrompt( prompt ){
        // build our prompt object if needed
        if( typeof prompt === 'string' ){
            prompt = { name : prompt };
        }

        // add name and data to our prompt
        this.data.prompt.name = prompt.name ?? null;
        this.data.prompt.data = prompt.data ?? null;

        // should this player be set to active? Defaults to true
        this.data.active = prompt.active ?? true;

        // should we send the current game data to all players
        if( prompt.update ){
            await this.game().pushGameDataToPlayers();
        }

        // should we send the game's player data to all players
        if( prompt.updatePlayerData ){
            await this.game().updatePlayerData();
        }
    }


    /**
     * return this player's socket.io socket
     *
     * @returns {Socket}
     */
    socket(){
        return Server.io.sockets.connected[this.socketId];
    }


    /**
     * return this player's game object
     *
     * @returns {Game}
     */
    game(){
        return Server.games[this.gameId];
    }


    /**
     * Returns this player's faction object
     *
     * @returns {Faction}
     */
    faction(){
        return this.game().factions[ this.data.faction ];
    }


    /**
     * Join a socket.io room
     *
     * @param {string} room
     */
    async joinRoom( room ) {
        let oldRoom = this.room;

        // leave all existing rooms
        this.callSocket( 'leaveAll' );

        // join our new room
        this.room = room;
        this.callSocket( 'join', room );

        let roomName = room === 'lobby' ? 'lobby' : 'game';
        Server.message( this.room, { message: `joined ${roomName}`, player : this });

        // if we are joining the lobby update the lobby population by joining the lobby
        if( roomName === 'lobby' ){
            Server.updateLobbyPopulation( this, true );
            return;
        }

        // if we are leaving the lobby update the lobby population by leaving the lobby
        if( oldRoom === 'lobby' ) {
            Server.updateLobbyPopulation( this, false );
        }
    }

    /**
     * Emit an event to all of the other players in this room
     *
     * @param {string} room
     * @param {string} emit // the event to emit
     * @param args
     */
    emitToOthers( room, emit, ...args ){
        let socket = this.socket();
        if( socket ){
            socket.to( room ).emit( emit, ...args );
        }
    }


    /**
     * Call a method on this player's socket, if it exists
     *
     * @param {string} method // the method to call on our socket
     * @param args // any arguments we need to pass to the socket
     */
    callSocket( method, ...args ){
        let socket = this.socket();
        if( socket ){
            socket[method]( ...args );
        } else {
            console.log( 'No Socket present' );
        }
    }
}



module.exports = Player;
