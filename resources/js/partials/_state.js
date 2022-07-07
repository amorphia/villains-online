window.App.state = {

    csrf : null, // store our csrf token
    data : null, // store our game data
    game : null, // store our game id
    lobbyPlayers : {}, // players in the lobby
    savedGames : [], // store our saved games
    openSettings : false, // should the settings panel be open?
    openCheatSheets : false, // should the cheat sheets panel be open?
    player : null, // store our current player
    faction : null, // store our current faction
    actions : null, // store our available actions
    action : null, // store our current action
    card : null, // store our selected card
    token : null, // store our selected token
    unit: null, // store our selected unit
    showXavier : false, // should we show xavier blackstone during token placement?
    viewDiscard : false, // should we open the discard pile?
    messages : [], // store game messages
    playerIndex : null, // store the current player index
    factionName : null, // store the current faction name
    id : null, // store our player id
    name : null, // store our player name

    // track the current influence leader for each area
    areaLeaders : {
        'capitol' : null,
        'sewers' : null,
        'police' : null,
        'laboratory' : null,
        'factory' : null,
        'bank' : null,
        'university' : null,
        'subway' : null,
        'church' : null,
    },

    // a map of text strings to convert to an image when calling the filterText() method
    filterMap : {
        'xSEEKx': '<img class="icon-image ml-3" src="/images/icons/seeking.png">',
        'xIx': '<img class="icon-image ml-3" src="/images/icons/influence.png">',
        'xCAP1x': '<img class="icon-image ml-3" src="/images/tokens/capitol-1-points.png">',
        'xCAP2x': '<img class="icon-image ml-3" src="/images/tokens/capitol-2-points.png">',
        'xCAP3x': '<img class="icon-image ml-3" src="/images/tokens/capitol-3-points.png">',
        'xCAP4x': '<img class="icon-image ml-3" src="/images/tokens/capitol-4-points.png">',
        'xAPx': '<img class="icon-image ml-3" src="/images/icons/ap.png">',
        'xPPx': '<img class="icon-image ml-3" src="/images/icons/pp.png">',
        'xAP1x': '<img class="icon-image ml-3" src="/images/icons/ap-1.png">',
        'xAP2x': '<img class="icon-image ml-3" src="/images/icons/ap-2.png">',
        'xAP3x': '<img class="icon-image ml-3" src="/images/icons/ap-3.png">',
        'xPP1x': '<img class="icon-image ml-3" src="/images/icons/pp-1.png">',
        'xPP2x': '<img class="icon-image ml-3" src="/images/icons/pp-2.png">',
        'xPP3x': '<img class="icon-image ml-3" src="/images/icons/pp-3.png">',
        'xRx': '<img class="icon-image ml-3" src="/images/icons/resource.png">',
        'xC0x': '<img class="icon-image ml-3" src="/images/icons/cost-0.png">',
        'xC1x': '<img class="icon-image ml-3" src="/images/icons/cost-1.png">',
        'xC2x': '<img class="icon-image ml-3" src="/images/icons/cost-2.png">',
        'xC3x': '<img class="icon-image ml-3" src="/images/icons/cost-3.png">',
        'xC4x': '<img class="icon-image ml-3" src="/images/icons/cost-4.png">',
        'xC5x': '<img class="icon-image ml-3" src="/images/icons/cost-5.png">',
        'xC6x': '<img class="icon-image ml-3" src="/images/icons/cost-6.png">',
        'xC7x': '<img class="icon-image ml-3" src="/images/icons/cost-7.png">',
        'xC8x': '<img class="icon-image ml-3" src="/images/icons/cost-8.png">',
        'xC9x': '<img class="icon-image ml-3" src="/images/icons/cost-9.png">',
        'xC10x': '<img class="icon-image ml-3" src="/images/icons/cost-10.png">',
        'xC11x': '<img class="icon-image ml-3" src="/images/icons/cost-11.png">',
        'xC12x': '<img class="icon-image ml-3" src="/images/icons/cost-12.png">',
        'xC13x': '<img class="icon-image ml-3" src="/images/icons/cost-13.png">',
        'xC14x': '<img class="icon-image ml-3" src="/images/icons/cost-14.png">',
        'xC15x': '<img class="icon-image ml-3" src="/images/icons/cost-15.png">',
        'xA1x': '<img class="icon-image ml-3" src="/images/icons/attack-1.png">',
        'xA2x': '<img class="icon-image ml-3" src="/images/icons/attack-2.png">',
        'xA3x': '<img class="icon-image ml-3" src="/images/icons/attack-3.png">',
        'xA4x': '<img class="icon-image ml-3" src="/images/icons/attack-4.png">',
        'xA5x': '<img class="icon-image ml-3" src="/images/icons/attack-5.png">',
        'xA6x': '<img class="icon-image ml-3" src="/images/icons/attack-6.png">',
        'xA7x': '<img class="icon-image ml-3" src="/images/icons/attack-7.png">',
        'xA8x': '<img class="icon-image ml-3" src="/images/icons/attack-8.png">',
        'xA9x': '<img class="icon-image ml-3" src="/images/icons/attack-9.png">',
        'xA10x': '<img class="icon-image ml-3" src="/images/icons/attack-10.png">',
        'xA11x': '<img class="icon-image ml-3" src="/images/icons/attack-11.png">',
        'xA12x': '<img class="icon-image ml-3" src="/images/icons/attack-12.png">',
        'xA13x': '<img class="icon-image ml-3" src="/images/icons/attack-13.png">',
        'xA14x': '<img class="icon-image ml-3" src="/images/icons/attack-14.png">',
        'xA15x': '<img class="icon-image ml-3" src="/images/icons/attack-15.png">',
        'xA16x': '<img class="icon-image ml-3" src="/images/icons/attack-16.png">',
        'xA17x': '<img class="icon-image ml-3" src="/images/icons/attack-17.png">',
        'xA18x': '<img class="icon-image ml-3" src="/images/icons/attack-18.png">',
    },

    actionTypes : {
        'pass' :{
            buttonMessage : 'Pass for the turn',
        },
        'skip' : {
            buttonMessage: 'Skip this action',
        },
        locked : {
            buttonMessage: 'Declare yourself locked',
        },
        'token' : {
            useMessage: 'reveal token',
            areaAction : true,
        },
        'skill' : {
            img : '/images/icons/skilled.png',
            useMessage: 'use skill',
            areaAction : true,
        },
        'magick' : {
            img : '/images/icons/enchanted.png',
            useMessage: 'use magick',
            areaAction : true,
            buttonMessage: 'Flip your units in this area to use magick'
        },
        'loop' : {
            img : '/images/icons/loop.png',
            useMessage: 'use loop',
            areaAction : true,
            buttonMessage: 'Replace your Loop token'
        },
        'ambush' : {
            img : '/images/icons/ambush.png',
            useMessage: 'ambush',
            areaAction : true,
        },
        'materialize' : {
            img : '/images/icons/ghost.png',
            useMessage: 'materialize',
            areaAction : true,
        },
        'xavier' : {
            useMessage: 'xavier token',
            buttonMessage: 'Reveal token on Xavier'
        },
    },

    /**
     * Repor an error in the console
     * @param error
     */
    errorReport( error ) {
        console.log( error.message );
        console.log( error.data );
    },


    /**
     * Initialize a shared property into the state
     *
     * @param property
     * @param value
     */
    init( property, value ) {

        let propertyArr = property.split('.');
        property = propertyArr.pop();
        let object = this;

        propertyArr.forEach( prop => {

            try {
                // if our current object variable isn't actually an object itself run away
                if( ! _.isObject( object ) ){
                    throw { message : `Invalid object`, data: object };
                }

                // if our current object variable does in fact have the appropriate property,
                // set our object variable to that property, otherwise throw an error
                if( prop in object ){
                    object = object[ prop ];
                } else {
                    throw { message : `Invalid Property: ${ prop } missing from:`, data: object };
                }

            } catch ( error ) {
                this.errorReport( error );
            }
        });

        try {
            // check to make sure we haven't already initialized this object and
            // if we haven't the set it up and make sure its reactive using Vue.set
            if( property in object ) {
                throw { message : `Cannot Initiate existing property: ${ property } on:`, data: object };
            } else {
                Vue.set( object, property, value );
            }
        } catch ( error ) {
            this.errorReport( error );
        }
    },

    /**
     * Filter the given text replacing anything in our filterMap with the appropriate images
     *
     * @param text
     * @returns {string|void}
     */
    filterText( text ){
        let regex = Object.keys( this.filterMap ).join('|');
        let _map = this.filterMap;
        return text.replace( new RegExp( regex, 'gi'), function( matched ){
            return _map[matched];
        });
    },


    /**
     * If the given player the first player?
     *
     * @param player
     * @returns {boolean}
     */
    isFirstPlayer( player ){
        return player.id === this.data.playerOrder[0];
    },


    /**
     * Handle emitting from our socket
     *
     * @param event
     * @param args
     */
    socketEmit( event, ...args ){
        this.socket.emit( event, this.data.id, ...args );
    },


    /**
     * Respond to an action prompt
     *
     * @param event
     * @param args
     */
    respond( event, ...args ){
        // emit response to our prompt
        this.socket.emit( 'respond', this.data.id, event, ...args );

        // clear our prompt
        this.player.prompt = false;

        // unselect any areas
        App.event.emit('unselectAreas' );

        // ~~click~~
        App.event.emit( 'sound', 'ui' );
    },


    /**
     * Return the given player's faction
     *
     * @param player
     * @returns {object} // faction data
     */
    getPlayerFaction( player ) {
        let faction = Object.values( this.data.factions ).find( faction => faction.owner === player.id )
        return  faction ? faction : {};
    },


    /**
     * Helper for returning this player's faction
     *
     * @returns {object}
     */
    getFaction(){
        return this.getPlayerFaction( this.player );
    },


    /**
     * Return the url for the given faction's icon
     *
     * @param factionName
     * @returns {string}
     */
    factionIcon( factionName ){
        if( typeof factionName !== 'string' ) factionName = factionName?.name;
        return _.factionIcon( factionName );
    },


    /**
     * Can we see the given faction's target?
     *
     * @param faction
     * @returns {boolean}
     */
    canSeeTarget( faction ){

        // if this is us, then sure
        if( this.faction.name === faction.name ){
            return true;
        }

        // if we are allowed to spy on this faction, then sure
        if( this.faction.spy === faction.name ) {
            return true;
        }

        // if we are allowed to spy on all factions and have selected our target already (or are the mafia), then sure
        if( this.faction.spyAll && ( this.faction.cards.target.length || this.faction.name === 'mafia') ){
            return true;
        }
    },


    /**
     * Return the given player's faction name
     * @param player
     * @returns {string}
     */
    getPlayerFactionName( player ){
        return this.getPlayerFaction( player ).name;
    },


    /**
     * Get the current player's data
     * @returns {object}
     */
    getPlayer(){
        let player = this.data?.players[this.id];
        if(player) return player;

        let spectator = this.data?.spectators[this.id];
        if(spectator){
            spectator.isSpectator = true;
            return spectator;
        }

        return {};
    },


    /**
     * Is the current player active?
     *
     * @returns {boolean}
     */
    isActive(){
       return this.getPlayer()?.active;
    },


    /**
     * Group a collection by the given grouping and return the count of each group
     *
     * @param collection
     * @param grouping
     */
    groupByCount( collection, grouping ) {
        let output = _.groupBy( collection, grouping );
        _.forEach( output, ( object, prop ) => output[prop] =  output[prop].length );
        return output;
    },

};



