window.App.state = {


    filterMap : {
        'xIx': '<img class="icon-image ml-3" src="/images/icons/influence.png">',
        'xCAP1x': '<img class="icon-image ml-3" src="/images/tokens/capitol-1-points.png">',
        'xCAP2x': '<img class="icon-image ml-3" src="/images/tokens/capitol-2-points.png">',
        'xCAP3x': '<img class="icon-image ml-3" src="/images/tokens/capitol-3-points.png">',
        'xCAP4x': '<img class="icon-image ml-3" src="/images/tokens/capitol-4-points.png">',
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

    filter : [],

    debug : false,
    csrf : null,
    data : null,
    game : null,
    lobbyPlayers : {},
    savedGames : [],
    openSettings : false,
    player : null,
    faction : null,
    actions : null,
    action : null,
    card : null,
    token : null,
    showXavier : false,
    viewDiscard : false,
    messages : [],
    playerIndex : null,
    factionName : null,
    id : null,
    name : null,
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

    errorReport( error ) {
        console.log( error.message );
        console.log( error.data );
    },

    init( property, value ) {

        if ( this.debug ){
            console.log( `set ${property} to:` );
            console.log( value );
        }

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

    filterText( text ){
        let regex = Object.keys( this.filterMap ).join('|');
        let _map = this.filterMap;
        return text.replace( new RegExp( regex, 'gi'), function( matched ){
            return _map[matched];
        });
    },

    isFirstPlayer( player ){
        //return player.index === this.data.firstPlayer;
        return player.id === this.data.playerOrder[0];
    },

    getFaction(){
        return this.getPlayerFaction( this.player );
    },

    socketEmit( event, ...args ){
        this.socket.emit( event, this.data.id, ...args );
    },

    respond( event, ...args ){
        this.socket.emit( 'respond', this.data.id, event, ...args );
        this.player.prompt = false;
        App.event.emit('unselectAreas' );
        App.event.emit( 'sound', 'ui' );
    },

    getPlayerFaction( player ) {
        let faction = null;
        _.forEach( this.data.factions, ( value, prop ) => {
            if( value.owner == player.id ){
                faction = this.data.factions[prop];
            }
        });

        return faction;
    },

    canSeeTarget( faction ){

        if( this.faction.name === faction.name ){
            return true;
        }

        if( this.faction.spy === faction.name ) {
            return true;
        }

        if( this.faction.spyAll && ( this.faction.cards.target.length || this.faction.name === 'mafia') ){
            return true;
        }
    },

    getPlayerFactionName( player ){
        return this.getPlayerFaction( player ).name;
    },

    getPlayer(){
        return this.data.players[this.id];
    },

    isActive(){
       return this.getPlayer().active;
    },


    groupByCount( collection, grouping ) {
        let output = _.groupBy( collection, grouping );
        _.forEach( output, ( object, prop ) => output[prop] =  output[prop].length );
        return output;
    },

    currentCash(){
        return this.faction.resources + this.faction.energy;
    }

}



