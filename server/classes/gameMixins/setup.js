
let setup = {

    /**
     * Handle a player response to the "choose faction" prompt
     *
     * @param player
     * @param factionName
     * @param random
     * @param xed
     */
    async chooseFaction( player, factionName, random, xed ){
        if( ! player.data.active ) return;
        let faction = this.data.factions[ factionName ];

        // set player data and faction owner
        player.data.faction = factionName;
        faction.owner = player.id;

        // emit faction selected and advance the active player
        Server.io.to( this.id ).emit( 'factionSelected', factionName );
        this.advanceActivePlayer();

        // send our game log message for this player's choice, being sure to laud those players bold enough to
        // choose their faction randomly
        let message = `chooses the ${factionName}`;
        if( this.data.gameType === "secret" ) message = `chooses a faction`;
        if( random && !xed ) message = `Like the mighty eagle ${player.data.name} randomly ${message}`;
        if( random && xed ) message = `Like the morally-complex goose ${player.data.name} semi-randomly ${message} after crossing off ${xed} faction${xed > 1 ? 's' : ''}`;

        this.message({ message: message, player : player, class : (random) ? 'highlight' : ''  });

        // update players
        await this.pushGameDataToPlayers();

        // if all players have chosen their factions then build the game world
        // and start the first turn
        if( this.allPlayersHaveFactions() ){
            this.generateGame();
            this.handleFactionSetupTriggers();
            this.resolveStartOfTurnStep();
        }
    },


    handleFactionSetupTriggers(){
        Object.values( this.factions ).forEach( faction => {
            if( faction.triggers.onSetup ) faction[faction.triggers.onSetup]();
        });
    },


    /**
     * Manage loading a saved game
     *
     * @param saved
     */
    async loadSavedGame( saved ){

        this.data.state = 'loading';

        // update the game's player sockets to make sure they match the player's current socket IDs
        this.updatePlayerSockets( saved );
        this.updateSpectatorSockets( saved );

        // build the game world
        this.generateGame( saved );

        // merge in the saved data
        this.mergeSavedData( saved );

        // run each faction's on setup trigger
        this.handleFactionSetupTriggers();

        // add each player to this game room
        this.addPlayersToRoom();
        this.addSpectatorsToRoom();

        // push the game data to each player
        await this.pushGameDataToPlayers();

        // if we are loading a turn save fire off the proper step
        if( saved.saveNote === 'start-of-turn' ) this.handleStartOfTurn();
        if( saved.saveNote === 'post-combat' ) this.resolveEndOfTurnStep();
    },


    /**
     * update the game's player sockets to make sure they match the player's current socket IDs
     * and have them join the game
     *
     * @param saved
     */
    updatePlayerSockets( saved ){
        _.forEach( saved.players, (player, id) =>{
            if( Server.players[id] ){
                player.socketId = Server.players[id].socketId;
                this.joinGame( Server.players[id] );
            }
        });

        delete saved.data.socketMap;
    },

    updateSpectatorSockets( saved ){
        _.forEach( saved.spectators, (player, id) =>{
            if( Server.players[id] ){
                player.socketId = Server.players[id].socketId;
                this.addSpectator( Server.players[id] );
            }
        });

        delete saved.data.socketMap;
    },


    /**
     * Handle merging the saved game data into our generated game object
     *
     * @param saved
     */
    mergeSavedData( saved ){

        // update our saved socketmap to our current socket map so we don't merge in outdated socket IDs
        saved.socketMap = this.socketMap;

        // set our game action
        this.data.gameAction = saved.data.gameAction;

        // the linking function we will use to make sure we rebuild all of our
        // references properly when merging in saved game data
        let linkFunc = ( objVal, srcVal ) => {
            if ( _.isArray( objVal ) ) {
                let linked = [];
                srcVal.forEach( (item, index) => {
                    if( item && item.id ){
                        linked.push( this.objectMap[item.id] );
                    } else {
                        linked.push( srcVal[index] );
                    }
                });
                return linked;
            }
        };

        // merge data
        _.mergeWith( this.data, saved.data, linkFunc );

        // merge factions
        _.forEach( this.factions, (faction, name) => {
            _.mergeWith( faction.data, saved.factions[name].data, linkFunc );
        });

        // merge players
        _.forEach( this.players, (player, id) => {
            player.listeners = saved.players[id].listeners;
            player.data = saved.players[id].data;
            this.data.players[id] = player.data;
        });

        // merge areas
        _.forEach( this.areas, (area, name) => {
            area.endOfTurn = saved.areas[name].endOfTurn;
            _.mergeWith( area.data, saved.areas[name].data, linkFunc );
        });

        // merge deck
        _.mergeWith( this.deck, saved.deck, linkFunc );
        this.data.discard = this.deck.discard;

    },


    /**
     * Start our game, wee haw!
     *
     * @param player
     * @param options
     */
    async startGame( player, options = {} ){
        // if we aren't currenly open then there must be a mistake, abort!
        if( this.data.state !== 'open' ) return;

        // set game options
        Object.assign( this.data, options );

        // play to 13 points in thirteenPoints mode
        if(this.data.options.thirteenPoints){
            this.data.maxAP = 13;
            this.data.maxPP = 13;
        }

        // create a new save game model in the DB
        Server.saveNewGame( this );

        this.data.state = 'choose-factions';
        this.data.factions = _.cloneDeep( require('../data/factionList') );

        // randomize our player order and add those players to this socket.io game room
        this.randomizePlayerOrder();

        this.removeAreas();

        if(this.data.gameType === "secret"){
            this.generatePlayerFactionOptions();
        }

        this.addPlayersToRoom();

        // close our game to new players
        Server.closeOpenGame();

        // push our game data to each player
        await this.pushGameDataToPlayers();

        // set our game timeout counter
        this.setTimeout();
    },

    removeAreas(){
        // if we have 4 more more players, all areas are active.
        if( this.data.playerOrder.length > 3 ) return this.data.areaOrder = [ ...this.data.allAreas ];

        // if we have a fewer than 4 players choose 2 areas to be ignored.
        let ignorableAreas = this.data.allAreas.filter( area => area !== "capitol" );
        let ignoredArea = _.shuffle( ignorableAreas ).pop();
        this.data.ignoredAreas = [ ignoredArea, this.areaOpposite[ignoredArea] ];
        this.data.areaOrder = this.data.allAreas.filter( area => !this.data.ignoredAreas.includes( area ) );
    },

    generatePlayerFactionOptions(){
        let killFactions = _.shuffle( Object.values(_.cloneDeep( this.data.factions )).filter( faction => faction.killer ).map( faction => faction.name ) );
        let basicFactions = _.shuffle( Object.values(_.cloneDeep( this.data.factions )).filter( faction => !faction.killer && faction.basic ).map( faction => faction.name ) );
        let otherFactions = Object.values(_.cloneDeep( this.data.factions )).filter( faction => !faction.killer && !faction.basic ).map( faction => faction.name );

        let options = [];

        // populate our kill factions
        options.push(killFactions.splice(0, this.secretFactionSelection));

        // populate our basic factions
        options.push(basicFactions.splice(0, this.secretFactionSelection));

        // populate our other factions
        otherFactions = _.shuffle([...basicFactions, ...otherFactions]);

        for(let i = 0; i < this.data.playerOrder.length - 2; i++){
            options.push(otherFactions.splice(0, this.secretFactionSelection));
        }

        options = _.shuffle( options );

        this.data.factionOptions = {};
        this.data.playerOrder.forEach( (player, index) => this.data.factionOptions[player] = options[index]);
    },


    /**
     * Generate our game's core object class instances
     *
     * @param saved // optional
     */
    generateGame( saved = null ){
        this.buildActionDeck( saved );
        this.buildFactions( saved );
        this.buildAreas( saved );
        this.started = true;
        Server.io.to('lobby').emit( 'activeGames', Server.getActiveGames() );
    },


    /**
     * Build up our Faction instances
     *
     * @param saved
     */
    buildFactions( saved = null ){
        let factionClasses = require( '../Factions' );

        // if we have a saved state to build from generate our temporary factions object from that saved state,
        // otherwise clone the this.data.factions object which would be filled with simple data objects after
        // the choose factions step, and not fully initialized Faction classes
        let tempFactions = saved ? this.generateTempFactionsFromSaveData( saved ) : _.clone( this.data.factions );

        this.data.factions = {};

        // build our final full faction instances
        _.forEach( tempFactions, ( value, name ) => {
            if( value.owner !== null ){
                let faction = new factionClasses[name]( value.owner, this );
                faction.setupUnits( saved );
                faction.setupTokens( saved );
                faction.setupPlans( saved );
                if( faction.setupOrders ) faction.setupOrders( saved );
                this.factions[name] = faction;
                this.data.factions[name] = faction.data;
            }
        });
    },


    /**
     * Generate our temporary factions list of simple objects from our saved game data
     *
     * @param saved
     */
    generateTempFactionsFromSaveData( saved ){
        let factions = {};
        _.forEach( saved.data.factions, (value, name) => {
            factions[name] = { owner : value.owner };
        });
        return factions;
    },


    /**
     * Build our Area instances and set our neutral area
     */
    buildAreas( saved = null ) {
        let areaClasses = require('../Areas');

        let ignoredAreas = saved ? saved.data.ignoredAreas : this.data.ignoredAreas;

        _.forEach( areaClasses, (Func, name) => {
            let area = new Func( name, this );

            if( ignoredAreas.includes( name ) ){
                this.data.ignoredAreaData[name] = area.data;
                this.data.ignoredAreaData[name].ignored = true;
                return;
            }

            this.areas[name] = area;
            this.data.areas[name] = area.data;

            if(this.data.ignoredAreas.length){
                area.updateAdjacency( this.data.ignoredAreas );
            }
        });

        if(!saved ){
            this.setNeutralArea();
        }

    },

    /**
     * Determine which area will be neutral controlled at the start of the turn
     */
    setNeutralArea(){
        // roll an 8 sided die to decide our neutral controlled area
        let roll = _.roll( 1, 8 - this.data.ignoredAreas.length, this );
        let startingArea = this.areas[ this.data.areaOrder[roll] ];

        // check if any of our factions should take over for the neutral area
        for(let faction of Object.values(this.factions)){
            if(!faction.data.controlNeutralSetupArea) continue;

            this.message({ message: `The ${startingArea.name} is controlled by <span class="faction-${faction.name}">${faction.name}</span>`, class: 'none' });
            return faction.gainControlOfArea( startingArea );
        }

        this.message({ message: `The ${startingArea.name} is controlled by neutrals`, class: 'none' });
        startingArea.data.owner = 'neutral';

    },


    /**
     * Build the action deck by instantiating the appropriate card classes then shuffling the deck
     *
     * @param saved
     */
    buildActionDeck( saved = null ){
        // instantiate our Action Card handler classes
        let cardClasses = require('../Cards');
        _.forEach( cardClasses, (Func, name) => {
            this.cards[name] = Func;
        });

        // Create our card objects deck
        let cards = _.cloneDeep( require('../data/cardList') );
        cards.forEach( card => {
            let includeExpansionCards = saved?.data?.options?.expansionCards ?? this.data.options?.expansionCards;

            // filter our expansion cards if not playing with them
            if(card.expansion && !includeExpansionCards) return;

            card.owner = null;
            card.area = null;
            card.status = null;

            if( card.catchUp ){
                card.file += "-catchup";
            }

            /*
            if(this.data.ignoredAreas.includes( card.target )){
                card.target = this.targetShifts[card.target][card.shift];
            }
            */

            this.newObject( card, saved );
            this.deck.deck.push( card );
        });


        // shuffle the deck and set up the appropriate references
        this.shuffle( this.deck.deck );
        this.data.discard = this.deck.discard;
        this.data.deckCount = this.deck.deck.length;
    },


    /**
     * Returns whether every player has been assigned a faction yet or not
     *
     * @returns {boolean}
     */
    allPlayersHaveFactions(){
        return Object.values( this.players ).every( player => player.data.faction );
    },


    /**
     * Add each player to the socket.io room for this game
     */
    addPlayersToRoom(){
        let room = this.data.id;
        _.forEach( this.players, ( player, id ) =>{
            player.joinRoom( room );
        });
    },

    addSpectatorsToRoom(){
        let room = this.data.id;
        _.forEach( this.spectators, ( player, id ) =>{
            player.joinRoom( room );
        });
    },

    /**
     * Shuffle the player order and set the active player by the newly shuffled order
     */
    randomizePlayerOrder() {

        // build our players array
        let players = [];
        for( let player in this.players ) {
            players.push( player );
        }

        //shuffle it
        this.shuffle( players );

        // store our player order in the game object and set the active player
        this.data.playerOrder = players;
        this.setActivePlayerByPlayerOrder();
    },

};

module.exports = setup;
