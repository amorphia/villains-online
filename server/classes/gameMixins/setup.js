
let setup = {

    loadSavedGame( saved ){
        this.data.state = 'loading';
        this.updatePlayerSockets( saved );
        this.generateGame( saved );
        this.mergeSavedData( saved );
        _.forEach( this.factions, faction => faction.onSetup() );
        this.addPlayersToRoom();
        this.updateAll();
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

        let linkFunc = ( objVal, srcVal ) => {
            if (_.isArray( objVal ) ) {
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
        _.merge( this.data, saved.data );

        // merge objectMap
        _.mergeWith( this.objectMap, saved.objectMap, linkFunc );

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

    startGame(){
        if( this.data.state !==  'open' ) return;

        Server.saveNewGame( this );

        this.data.state = 'choose-factions';
        this.data.factions = _.cloneDeep( require('../data/factionList') );

        this.randomizePlayerOrder();
        this.addPlayersToRoom();
        Server.closeOpenGame();
        this.updateAll();
        this.setTimeout();
    },


    chooseFaction( player, factionName ){
        if( ! player.data.active ) return;

        let faction = this.data.factions[ factionName ];

        player.data.faction = factionName;
        faction.owner = player.id;

        Server.io.to( this.id ).emit( 'factionSelected', factionName );
        this.advanceActivePlayer();

        this.message({ message: `chose the ${factionName}`, player : player });
        this.updateAll();

        if( this.allPlayersHaveFactions() ){
            this.generateGame();
            _.forEach( this.factions, faction => faction.onSetup() );
            this.startTurn();
        }
    },

    generateGame( saved ){
        this.buildActionDeck();
        this.buildAreas();
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
                faction.setupUnits();
                faction.setupTokens();
                faction.setupPlans();
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
            let rand = -1 + _.roll(1, 9 );
            startingArea = this.areas[ this.data.areaOrder[rand] ];
        }

        startingArea.data.owner = 'neutral';

        this.message({ message: `The ${startingArea.name} is controlled by neutrals`, class: 'none' });
    },

    buildActionDeck(){
        let cardClasses = require('../Cards');
        _.forEach( cardClasses, (Func, name) => {
            this.cards[name] = new Func( this );
        });

        let cards = _.cloneDeep( require('../data/cards') );
        cards.forEach( card => {
            card.owner = null;
            card.area = null;
            card.status = null;

            this.newObject( card );
            this.deck.deck.push( card );
        });

        this.shuffle( this.deck.deck );
        this.data.discard = this.deck.discard;
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

        /*
        players.forEach( ( player, index ) => {
            this.players[player].data.index = index;
        });
        */

        this.data.playerOrder = players;
        this.setActivePlayerByPlayerOrder();
    },

};

module.exports = setup;
