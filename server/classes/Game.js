const Player = require( "./Player" );
const PlanTester = require( "./PlanTester" );

class Game {

    defaultSlideSpeed = 5;
    titleCardTimer = 3;
    fastMode = false;
    testMode = false;

    static events = [
        'leaveGame',
        'startGame',
        'joinGame',
        'chooseFaction',
        'chooseTargetPlan',
        'factionStartOfTurnResponse',
        'passToken',
        'sendBribe',
        'initPassAction',
        'initLockedAction',
        'initSkillAction',
        'initTokenAction',
        'pullToken',
        'activateToken',
        'respond'
    ];

    defaultListener;
    listening = {};
    id;
    socketMap = {};
    objectMap = {};
    created;
    combat = null;
    factions = {};
    players = {};
    cards = {};
    areas = {};
    deck = {
        deck : [],
        discard: []
    };
    capitolTokens = [
        { ap : 1, turn : 1 },
        { ap : 1, turn : 2 },
        { ap : 2, turn : 3 },
        { ap : 2, turn : 4 },
    ];

    data = {
        combat : null,
        playerAction : 0,
        id : null,
        state : 'open',
        phase : null,
        maxAP : 10,
        maxPP :12,
        turn : 1,
        discard : null,
        //firstPlayer : 0,
        activeIndex : 0,
        playerOrder : [],
        players : {},
        factions : {},
        areaIndex : 0,
        areas : {},
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


    constructor( saved ) {
        this.id = saved ? saved.id : uuid();
        this.data.id = this.id;
        this.created = Date.now();
        this.planTester = new PlanTester();

        if( process.env.HOMEPATH ===  '\\Users\\jerem' ) {
            this.fastMode = true;
        }

    }

    static initEvents( socket ){
        this.events.forEach( event =>  socket.on( event, (gameId, ...args) => this.gameEvent( event, socket, gameId, args ) ) );
    }

    async wait( seconds ) {
        return new Promise(resolve => {
            setTimeout( resolve, seconds * 1000 );
        });
    }


    async timedPrompt( prompt, data = {} ){
        if( !data.wait ){
            if( prompt === 'units-shifted' && data.units.length > 4 ){
                data.wait = 10;
            } else {
                data.wait = this.defaultSlideSpeed;
            }
        }

        data.passive = true;
        _.forEach( this.players, player => {
            player.setPrompt({
                name : prompt,
                data : data,
                active : false,
            });
        });

        this.updateAll();

        await this.wait( data.wait );

        this.clearAllPrompts();
    }


    static gameEvent( event, socket, gameId, args ){
        if( Server.games[gameId] ){
            let player = Server.getPlayer( socket );
            Server.games[gameId][event]( player, ...args );
        }
    }

    respond( player, action, ...args ){
        if( !player.listeners[action] ) return;

        let callback = player.listeners[action].callback;
        if( ! player.listeners[action].persist ) player.removeListener( action );

        args.unshift( player );

        if( typeof callback === "function" ){
            callback( args );
        } else {
            callback = _.camelCase( callback );
            console.log( 'callback:', callback );
            this[callback]( ...args );
        }
    }

    async promise( args = {}, updateAll = true ){

        return new Promise((resolve, reject) => {
            args.callback = args => resolve( args );
            this.listen( args );
            if( updateAll ) this.updateAll();
        });
    }

    listen( args ){
        args.name = args.name || this.defaultListener || this.data.phase;

        // good lord, an embarrassing end run around a bug I couldn't track down
        if( args.name === 'take-actions' ) args.name = 'choose-action';
        if( args.name === 'place-tokens' ) args.name = 'place-token';

        args.callback = args.callback || args.name;

        let players = this.getListenPlayers( args.players );
        players.forEach( player => player.listen( args ) );
    }

    getListenPlayers( players ){

        if( Array.isArray( players ) ) return players;
        if( players instanceof Player ) return [ players ];
        if( typeof players === 'string' ) return [ this.getPlayerById( players ) ];

        if( !players ){
            let result = [];
            _.forEach( this.players, (player,id) => result.push( player ) );
            return result;
        }

    }

    sound( sound, options = {} ){
        if( ! options.player ) {
            options.room = this.id;
        }

        Server.sound( sound, options );
    }

    message( message ){
        if( message.class === 'warning' ){
            this.sound( 'error' );
        }
        Server.message( this.data.id, message );
    }

    popup( player, popup ){
        Server.popup( player, this.data.id, popup );
    }

    messagePlayer( player, message ){
        Server.messagePlayer( player, message );
    }


    newObject( object ){
        object.id =  'o' + Object.keys( this.objectMap ).length;
        this.objectMap[object.id] = object;
        return object;
    }

    joinGame( player ){
        this.addPlayer( player );
    }

    leaveGame( player ){
        this.removePlayer( player );
    }

    shuffle( array ) {
        for( let i = array.length - 1; i > 0; i-- ) {
            const j = Math.floor( Math.random() * (i + 1) );
            [ array[i], array[j] ] = [ array[j], array[i] ];
        }
    }


    updateAll(){
        Server.io.to( this.id ).emit( 'update', this.data );
    }

    updatePlayerData(){
        Server.io.to( this.id ).emit( 'updatePlayerData', this.data.players );
    }

    updateResources(){
        let data = Object.values( this.data.factions ).map( faction => {
            return { 'faction' : faction.name, 'resources' : faction.resources  };
        });
        Server.io.to( this.id ).emit( 'updateResources', data );
    }

    drawCard(){

        if( !this.deck.deck.length ){
            this.deck.deck = this.deck.discard;
            this.shuffle( this.deck.deck );
            this.message({ message: 'Deck Reshuffled' });
        }

        return this.deck.deck.pop();
    }

    conclude( socket ){
        _.forEach( this.players, player => player.clearGameData() );
        Server.deleteGame( socket, this.id );
    }

}

/**
 *
 *  Mixins
 *
 */
Object.assign( Game.prototype, require( "./gameMixins/propertyMethods" ) );
Object.assign( Game.prototype, require( "./gameMixins/combat" ) );
Object.assign( Game.prototype, require( "./gameMixins/setup" ) );
Object.assign( Game.prototype, require( "./gameMixins/players" ) );
Object.assign( Game.prototype, require( "./gameMixins/startOfTurn" ) );
Object.assign( Game.prototype, require( "./gameMixins/placeTokensStep" ) );
Object.assign( Game.prototype, require( "./gameMixins/takeActionsStep" ) );
Object.assign( Game.prototype, require( "./gameMixins/combatStep" ) );
Object.assign( Game.prototype, require( "./gameMixins/endOfTurn" ) );

module.exports = Game;
