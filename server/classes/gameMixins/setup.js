
let setup = {

    async loadSavedGame( saved ){
        this.data.state = 'loading';

        this.updatePlayerSockets( saved );
        this.generateGame( saved );
        this.mergeSavedData( saved );
        _.forEach( this.factions, faction => faction.onSetup() );
        this.addPlayersToRoom();
        await this.pushGameDataToPlayers();
    },

    updatePlayerSockets( saved ){
        _.forEach( saved.players, (player, id) =>{
            if( Server.players[id] ){
                player.socketId = Server.players[id].socketId;
                this.joinGame( Server.players[id] );
            }
        });

        delete saved.data.socketMap;
    },

    mergeSavedData( saved ){

        saved.socketMap = this.socketMap;
        this.data.gameAction = saved.data.gameAction;

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
            faction.endOfTurn = saved.factions[name].endOfTurn;
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

        //this.relinkSavedData( saved.data );
    },


    relinkSavedData( saved ){
        this.relink( this.areas, saved.areas );
        this.relink( this.factions, saved.factions );
        this.relink( this.deck, saved.deck );
    },

    relink( target, source ){
        _.mergeWith( target, source, (objVal, srcVal) => {

            if( Server.playerSocketMap[objVal] ){
                return objVal;
            }

            if (_.isArray( objVal ) ) {
                let linked = [];
                srcVal.forEach( item => {
                   if( item && item.id ){
                       linked.push( this.objectMap[item.id]);
                   } else {
                       linked.push( srcVal );
                   }
                });
                return linked;
            }
        });
    },

    async startGame( player, options = {} ){
        if( this.data.state !==  'open' ) return;

        // set game options
        console.log( 'options', options );
        Object.assign( this.data, options );

        Server.saveNewGame( this );

        this.data.state = 'choose-factions';
        this.data.factions = _.cloneDeep( require('../data/factionList') );

        this.randomizePlayerOrder();
        this.addPlayersToRoom();
        Server.closeOpenGame();
        await this.pushGameDataToPlayers();
        this.setTimeout();
    },


    async chooseFaction( player, factionName, random ){
        if( ! player.data.active ) return;

        let faction = this.data.factions[ factionName ];

        player.data.faction = factionName;
        faction.owner = player.id;

        Server.io.to( this.id ).emit( 'factionSelected', factionName );
        this.advanceActivePlayer();

        let message = `chose the ${factionName}`;
        if( random ) message = `Like the mighty eagle ${player.data.name} randomly chooses the ${factionName} `;
        this.message({ message: message, player : player, class : random ? 'highlight' : ''  });
        await this.pushGameDataToPlayers();

        if( this.allPlayersHaveFactions() ){
            this.generateGame();
            _.forEach( this.factions, faction => faction.onSetup() );
            this.startTurn();
        }
    },

    generateGame( saved ){
        this.buildActionDeck( saved );
        this.buildAreas( saved );
        this.buildFactions( saved );
    },

    generateTempFactions( saved ){
        let factions = {};
        _.forEach( saved.data.factions, (value, name) => {
            factions[name] = { owner : value.owner };
        });
        return factions;
    },

    buildFactions( saved ){
        let factionClasses = require( '../Factions' );
        let tempFactions = saved ? this.generateTempFactions( saved ) : _.clone( this.data.factions );
        this.data.factions = {};
        _.forEach( tempFactions, ( value, name ) => {

            if( value.owner !== null ){
                let faction = new factionClasses[name]( value.owner, this );
                faction.setupUnits( saved );
                faction.setupTokens( saved );
                faction.setupPlans( saved );
                this.factions[name] = faction;
                this.data.factions[name] = faction.data;
            }
        });
    },

    buildAreas() {
        let areaClasses = require('../Areas');
        _.forEach(areaClasses, (Func, name) => {
            let area = new Func( name, this );
            this.areas[name] = area;
            this.data.areas[name] = area.data;
        });
        this.setNeutralArea();
    },

    setNeutralArea(){

        let startingArea;

        while( !startingArea || startingArea.name === 'capitol' ){
            let rand = -1 + _.roll(1, 9, this );
            startingArea = this.areas[ this.data.areaOrder[rand] ];
        }

        startingArea.data.owner = 'neutral';

        this.message({ message: `The ${startingArea.name} is controlled by neutrals`, class: 'none' });
    },

    buildActionDeck( saved ){
        let cardClasses = require('../Cards');
        _.forEach( cardClasses, (Func, name) => {
            this.cards[name] = new Func( this );
        });

        let cards = _.cloneDeep( require('../data/cardList') );
        cards.forEach( card => {
            card.owner = null;
            card.area = null;
            card.status = null;

            this.newObject( card, saved );
            this.deck.deck.push( card );
        });

        this.shuffle( this.deck.deck );
        this.data.discard = this.deck.discard;
        this.data.deckCount = this.deck.deck.length;
    },


    allPlayersHaveFactions(){
        let allHaveFactions = true;

        _.forEach( this.players, ( player, playerId ) => {
            if( ! player.data.faction ){
                allHaveFactions = false;
            }
        });

        return allHaveFactions;
    },

    addPlayersToRoom(){
        let room = this.data.id;
        _.forEach( this.players, ( player, id ) =>{
            player.joinRoom( room );
        });
    },

    randomizePlayerOrder() {

        let players = [];
        for( let player in this.players ) {
            players.push( player );
        }

        this.shuffle( players );

        this.data.playerOrder = players;
        this.setActivePlayerByPlayerOrder();
    },

};

module.exports = setup;
