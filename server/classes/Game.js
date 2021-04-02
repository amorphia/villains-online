const Player = require( "./Player" );
const PlanTester = require( "./PlanTester" );

class Game {

    /**
     * Settings
     */
    defaultSlideSpeed = 5; // how long in seconds to show passive slide prompts by default
    titleCardTimer = 3; // how long in seconds to show phase title cards
    godMode = true; // should we enter god mode (extra cards, and energy for factions) when running in the dev environment?
    doubleTargetsFourthTurn = false; // should we double target values on turn 4?
    playerTimeoutLength = 10; // how long to wait for a player to reconnect before checking for them again, in seconds
    maxPlayerTimeouts = 50; // how many timeout checks (in seconds above) to make before giving up

    /**
     * Internals
     */
    localServer; // are we currently on

    // The core event listeners, I'm gonna refactor most of these into our on the fly listener system eventually
    static events = [
        'leaveGame',
        'startGame',
        'joinGame',
        'chooseFaction',
        'chooseTargetPlan',
        'factionStartOfTurnResponse',
        'passToken',
        'sendBribe',
        'setPoints',
        'initPassAction',
        'initLockedAction',
        'initSkillAction',
        'initTokenAction',
        'pullToken',
        'activateToken',
        'respond'
    ];

    defaultListener; // the default listener, is set during each phase
    listening = {}; // map of current event listeners
    id; // game ID
    socketMap = {}; // map of player sockets
    objectMap = {}; // map of game components
    created; // created timestamp
    combat = null; // if we are resolving combat, that combat instance is stored here
    factions = {}; // object containing our faction objects
    players = {}; // object containing our player objects
    cards = {}; // object containing our active card instances
    areas = {}; // object containing our area objects

    // the action card decks
    deck = {
        deck : [],
        discard: []
    };

    // capitol tokens
    capitolTokens = [
        { ap : 1, turn : 1 },
        { ap : 1, turn : 2 },
        { ap : 2, turn : 3 },
        { ap : 2, turn : 4 },
    ];

    // the game data we share with the UI side
    data = {
        // settings
        maxAP : 12, // how many Area Points a player needs to win
        maxPP :12, // how many Plan Points a player needs to win
        upgradePoints : [ 4, 8 ], // how many points (on a single track) do players need to unlock their upgrades
        gameType : 'optimized', // our default game mode, basic/optimized/anarchy

        // internals
        rolls : [], // used to track the culminate die rolls made throughout the game
        creator : null, // the player who created this game
        gameAction : 0, // the current game action, increments with each action taken
        combat : null, // reference
        id : null, // game ID
        state : 'open', // the current game state
        phase : null, // the current game phase
        turn : 1, // the current turn
        discard : null, // the action deck discard pile is referenced here
        deckCount : 0, // how many cards left in the action deck
        reshuffled : false, // has the action deck been reshuffled this game?
        activePlayerIndex : 0, // the index of the active player
        playerOrder : [], // our current player order, cycles at the end of the turn
        players : {}, // reference to our players object
        factions : {}, // reference to our factions object
        areaIndex : 0, // used when working through each area in area order
        areas : {}, // reference to our areas object

        // each of the areas in order
        areaOrder : [
            'capitol',
            'sewers',
            'police',
            'laboratory',
            'factory',
            'bank',
            'university',
            'subway',
            'church'
        ],
    };


    /**
     * Build a new game instance
     *
     * @param saved // optional saved game to use to build a new game instance
     */
    constructor( saved = null ) {
        // if we are loading a saved game, set the ID to the saved ID, otherwise generate a new UUID
        this.id = saved ? saved.id : uuid();
        this.data.id = this.id;
        this.created = Date.now();
        this.planTester = new PlanTester();

        // if we are on a local dev environment set fast mode and local server mode
        if( process.env.APP_ENV === 'local' ) {
            this.localServer = true;
            this.fastMode = true;
            this.titleCardTimer = .5;
        }

        // create dice rolls array values for every possible roll from 1-10
        for( let i=1; i <= 10; i++ ){
            this.data.rolls[i] = 0;
        }
    }


    /**
     * Add each of our basic event listeners to a player's socket
     *
     * @param socket
     */
    static initEvents( socket ){
        this.events.forEach( event => {
            socket.on( event, (gameId, ...args) => this.gameEvent( event, socket, gameId, args ) );
        });
    }

    /**
     * Set a timeout to pause game progress for x seconds
     *
     * @param {number} seconds
     * @returns {Promise}
     */
    async wait( seconds ) {
        return new Promise(resolve => {
            setTimeout( resolve, seconds * 1000 );
        });
    }


    /**
     * Tell the Server to set/reset this games timeout counter
     */
    setTimeout(){
        Server.setTimeout( this.id );
    }


    /**
     * Display a passive timed prompt to each player
     *
     * @param {object} prompt
     * @param {object} data
     */
    async timedPrompt( prompt, data = {} ){

        data.wait = this.getTimedPromptWait( prompt, data );
        data.passive = true;

        // set each player to the given prompt
        _.forEach( this.players, player => {
            player.setPrompt({
                name : prompt,
                data : data,
                active : false,
            });
        });

        // push the updated data to all players
        await this.pushGameDataToPlayers();

        // wait our allotted wait time
        await this.wait( data.wait );

        // then clear the prompts from each player
        this.clearAllPrompts();
    }


    /**
     * Determine ho many seconds to wait for a timed prompt
     *
     * @param prompt
     * @param data
     * @returns {number}
     */
    getTimedPromptWait( prompt, data ){
        // if a wait was provided use that
        if( !isNaN( data.wait ) ) return data.wait;

        // if we are in fast mode, return 1 second
        if( this.fastMode ) return .25;

        // if this is the units-shifted prompt and we have a lot of units return 10 seconds
        if( prompt === 'units-shifted' && data.units.length > 4 ) return 10;

        // if all else fails, return the default slide speed
        return this.defaultSlideSpeed;
    }


    /**
     * Call a game event method from outside the game
     *
     * @param event // the game event method
     * @param socket // the socket initiating the call
     * @param gameId // the gameID
     * @param args // the method args
     */
    static gameEvent( event, socket, gameId, args ){
        let game = Server.games[gameId];
        if( game ){
            let player = Server.getPlayer( socket );
            game[event]( player, ...args );
        }
    }

    /**
     * Generate a promise to facilitate waiting for a player to respond to a prompt
     *
     * @param args // the arguments for the promise
     * @param {boolean} updateAll // should we update the game data to all players
     * @returns {Promise}
     */
    async promise( args = {}, updateAll = true ){

        return new Promise(async (resolve, reject) => {
            // create an anonymous function to be our callback to the event listener response
            args.callback = (args) => resolve( args );

            // set our event listener
            this.listen( args );

            // push updated game data to all players
            if( updateAll ) await this.pushGameDataToPlayers();
        });
    }



    /**
     * Handle a player response to a game prompt promise listener
     *
     * @param player
     * @param action
     * @param args
     */
    respond( player, action, ...args ){
        // if the player object isn't currently listening for this response then abort
        if( !player.listeners[action] ) return;

        // get our callback
        let callback = player.listeners[action].callback;

        // remove the player's event listener unless the listener is set to persist
        if( !player.listeners[action].persist ) player.removeListener( action );

        // add the player object to the start of the args array
        args.unshift( player );

        // if the callback is a function then call it with the provided arguments
        if( typeof callback === "function" ){
            callback( args );
            return;
        }

        // if the callback is a string convert the string to camelcase then
        // call that method on the game object
        if(  typeof callback === "string"  ){
            callback = _.camelCase( callback );
            this[callback]( ...args );
        }
    }




    /**
     * Set player event listeners for an outstanding event promise
     *
     * @param args
     */
    listen( args ){
        // set our listener name to the given name, or the default listener, or if all else fails the phase name
        args.name = args.name || this.defaultListener || this.data.phase;

        // good lord, an embarrassing end run around a bug I couldn't track down
        // where I manually adjust some listener names
        if( args.name === 'take-actions' ) args.name = 'choose-action';
        if( args.name === 'place-tokens' ) args.name = 'place-token';

        // if we are given a callback, use that callback. otherwise set the callback to the listener name
        args.callback = args.callback ?? args.name;

        // get the players for this listener
        let players = this.getListenPlayers( args.players );

        // for each of those players set the event listener
        players.forEach( player => player.listen( args ) );
    }


    /**
     * Returns the players for a given event listener
     *
     * @param players
     * @returns {array} // the players
     */
    getListenPlayers( players ){
        // if we have an array already, just return it
        if( Array.isArray( players ) ) return players;

        // if we are passed a player instance wrap that player in an array and return it
        if( players instanceof Player ) return [ players ];

        // if we are passed a playerId string grab the appropriate player and wrap them in an array then return it
        if( typeof players === 'string' ){
            let player = this.getPlayerById( players );
            if( player ) return [ player ];
        }

        // finally if none of the above applies just grab all of our players
        let result = [];
        _.forEach( this.players, (player,id) => result.push( player ) );
        return result;
    }


    /**
     * Emit a sound to one or all players
     *
     * @param sound
     * @param options
     */
    sound( sound, options = {} ){

        if( !options.player ) options.room = this.id;
        Server.sound( sound, options );
    }


    /**
     * Send a game log message to all players
     *
     * @param message
     */
    message( message ){
        if( message.class === 'warning' ){
            this.sound( 'error' );
        }
        Server.message( this.data.id, message );
    }


    /**
     * Send a popup to a player
     *
     * @param player
     * @param popup
     */
    popup( player, popup ){
        Server.popup( player, this.data.id, popup );
    }


    /**
     * Send a log message to a specific player
     *
     * @param player
     * @param message
     */
    messagePlayer( player, message ){
        Server.messagePlayer( player, message );
    }


    /**
     * Add the appropriate record keeping for a new object
     *
     * @param object // the object to handle
     * @param saved // an optional saved game to rebuild the object from
     * @returns {object}
     */
    newObject( object, saved = null ){

        // generate an object ID for this object by counting the number of items currently in the object map
        object.id =  'o' + Object.keys( this.objectMap ).length;

        // if we are given a saved game to build from and that save's object map has a matching itemID then
        // merge the object properties from the saved object to our object
        if( saved?.objectMap[object.id] ){
            Object.assign( object, saved.objectMap[object.id] );
        }

        // add this object to our object map
        this.objectMap[object.id] = object;

        return object;
    }


    /**
     * Shuffle an array
     *
     * @param array
     */
    shuffle( array ) {
        for( let i = array.length - 1; i > 0; i-- ) {
            const j = Math.floor( Math.random() * (i + 1) );
            [ array[i], array[j] ] = [ array[j], array[i] ];
        }
    }


    /**
     * return any players who don't have an active socket, of false if all players are present
     *
     * @returns {array|boolean}
     */
    getMissingPlayers(){
        let missing = [];
        _.forEach( this.players, player => {
            if( !player.socket() ) missing.push( player.data.name );
        });

        return missing.length ? missing : false;
    }


    /**
     * If we are planning on updating data, but there are players missing we use this method to wait
     * until all of the players are present
     */
    async waitForMissingPlayers(){
        let tries = 0;

        // while we have maxPlayerTimeouts remaining keep checking for all players to return
        while( this.getMissingPlayers() && tries < this.maxPlayerTimeouts ){
            this.message({ message: `waiting for players to rejoin: ${this.getMissingPlayers().join(', ') }`, class : 'red' });
            await this.wait( this.playerTimeoutLength );
            tries++;
        }

        // to get here either we have gotten all players back, or we have hit the maxPlayerTimeouts
        // if its the latter, then conclude the game
        if( this.getMissingPlayers() ){
            this.conclude( null, true );
        }
    }


    /**
     * Push the full game data to one or all players
     *
     * @param player // an optional single player to push data to
     */
    async pushGameDataToPlayers( player = null ){
        let recipient;

        // await check for all player sockets to exist
        if( this.getMissingPlayers() ){
            await this.waitForMissingPlayers();
        }

        // if we are given a player, update only that player
        if( player ){
            player.socket().emit( 'update', this.data );
            return;
        }

        // otherwise update all players
        Server.io.to( this.id ).emit( 'update', this.data );
    }


    /**
     * Push the data players object to each player
     */
    async updatePlayerData(){
        // await check for all player sockets to exist
        if( this.getMissingPlayers() ){
            await this.waitForMissingPlayers();
        }

        Server.io.to( this.id ).emit( 'updatePlayerData', this.data.players );
    }


    /**
     * Push each faction's current point totals to each player
     */
    async updatePoints(){
        // map our point totals
        let data = Object.values( this.data.factions ).map( faction => {
            return { 'faction' : faction.name, 'ap' : faction.ap, 'pp' : faction.pp };
        });

        // await check for all player sockets to exist
        if( this.getMissingPlayers() ){
            await this.waitForMissingPlayers();
        }

        // push to each player
        Server.io.to( this.id ).emit( 'updatePoints', data );
    }


    /**
     * Push each faction's current resource and energy count to each player
     */
    async updateResources(){
        // map our resources and energy
        let data = Object.values( this.data.factions ).map( faction => {
            return { 'faction' : faction.name, 'resources' : faction.resources, 'energy' : faction.energy  };
        });

        // await check for all player sockets to exist
        if( this.getMissingPlayers() ){
            await this.waitForMissingPlayers();
        }

        // push to each player
        Server.io.to( this.id ).emit( 'updateResources', data );
    }



    /**
     * Return a card from the top of the deck, id the deck is empty reshuffle the deck first
     *
     * @returns {object} // card
     */
    drawCard(){
        // reshuffle if needed
        if( !this.deck.deck.length ) this.shuffleDiscardIntoActionDeck();

        // pop the top card of the deck
        let card = this.deck.deck.pop();

        // update the deck count for the UI
        this.data.deckCount = this.deck.deck.length;

        return card;
    }


    /**
     * Reshuffle the discard pile into the action card deck
     */
    shuffleDiscardIntoActionDeck(){
        // grab the contents of the the discard pile
        let cards = this.deck.discard.splice( 0 );

        // rebuild the action deck card by card without breaking our deck references
        cards.forEach( card => this.deck.deck.push( card ) );

        // shuffle the deck
        this.shuffle( this.deck.deck );

        this.message({ message: 'Deck Reshuffled' });

        // flag the deck as reshuffled
        this.data.reshuffled = true;

        // reset the discard reference
        this.data.discard = this.deck.discard;
    }


    /**
     * Conclude this game
     *
     * @param socket
     * @param {boolean} timeout // was this game concluded due to a timeout?
     */
    conclude( socket, timeout ){
        if( timeout ) this.message({ message : 'Game timed out due to inactivity', class : 'warning' });

        // have each player leave the game
        _.forEach( this.players, player => player.leaveCurrentGame() );

        // delete the game from the server
        Server.deleteGame( socket, this.id );
    }

}

/**
 *
 *  Mixins
 *
 */
Object.assign( Game.prototype, require( "./gameMixins/valueMethods" ) );
Object.assign( Game.prototype, require( "./gameMixins/combat" ) );
Object.assign( Game.prototype, require( "./gameMixins/setup" ) );
Object.assign( Game.prototype, require( "./gameMixins/players" ) );
Object.assign( Game.prototype, require( "./gameMixins/startOfTurn" ) );
Object.assign( Game.prototype, require( "./gameMixins/placeTokensStep" ) );
Object.assign( Game.prototype, require( "./gameMixins/takeActionsStep" ) );
Object.assign( Game.prototype, require( "./gameMixins/combatStep" ) );
Object.assign( Game.prototype, require( "./gameMixins/endOfTurn" ) );

module.exports = Game;
