<template>
    <div class="villains-online d-flex align-stretch main-container pos-relative">
        <div class="main-content height-100 drawer__main" :class="{'drawer--closed' : chatClosed}">
            <!-- core game display -->
            <game-lobby v-if="!shared.data"></game-lobby>
            <choose-factions v-else-if="shared.data.state === 'choose-factions'"></choose-factions>
            <game-container v-else ></game-container>
        </div>
        <chat-window :closed="chatClosed" @toggleChat="chatClosed = !chatClosed"></chat-window>

    </div>
</template>


<script>
    export default {

        name: 'villains-online',
        data() {
            return {
                shared : App.state,
                chatClosed : false,
                disconnectionWait : 5, // how long to wait (in seconds) for a disconnected socket to reconnect before escalating
                reconnectTimeout : 1 // how long to wait (in seconds) between reconnection attempts
            };
        },

        watch : {
            'shared.socket.disconnected' : 'watchDisconnected',
            'shared.game' : 'watchSharedGame',
        },

        created(){
            this.shared.id = App.user.uuid;
            this.shared.name = App.user.name;
            this.shared.admin = App.user.admin;
            this.initSocket();
            this.initCoreSocketListeners();

            // bind our event handler to our shared state
            this.shared.init( 'event', App.event );

            // bind ordered players to our shared state
            this.shared.init( 'orderedPlayers', () => {
                if( !this.shared.data || !this.shared.data.playerOrder ) return;

                let players = [];
                this.shared.data.playerOrder.forEach( playerId => {
                    players.push( this.shared.data.players[ playerId ] );
                });
                return players;
            });

        },

        methods : {

            /**
             * Initialize our socket
             */
            initSocket(){
                let socket = io( App.server );
                this.shared.init( 'socket', socket );

                this.shared.socket.emit( 'newPlayer', {
                    name : App.user.name,
                    id : App.user.uuid
                });
            },


            /**
             * Initialize our core socket event listeners
             */
            initCoreSocketListeners(){
                // try to reconnect on disconnect
                this.shared.socket.on( 'disconnect', () => {
                    let socket = this.shared.socket;
                    let _this = this;

                    setTimeout( () => {
                        socket.connect();
                        socket.emit( 'newPlayer', { name : App.user.name, id : App.user.uuid });
                    }, _this.reconnectTimeout * 1000 );
                });

                // listen for open games
                this.shared.socket.on( 'openGame', (game ) => {
                    this.$set( this.shared, 'game', game );
                });

                // listen for saved games
                this.shared.socket.on( 'savedGame', game => {
                    this.shared.saveGame = game;
                });

                // listen for concluded game
                this.shared.socket.on( 'clearGame', this.clearGame );

                // listen for lobby players update
                this.shared.socket.on( 'lobbyPlayers', data => {
                    this.shared.lobbyPlayers = data;
                });

                // listen for full game data update
                this.shared.socket.on( 'update', data => {
                    App.event.emit('unselectAreas' );
                    this.shared.data = data;
                    this.shared.player = this.shared.getPlayer();
                    this.shared.faction = this.shared.getFaction();
                });

                // listen for player data update
                this.shared.socket.on( 'updatePlayerData', data => {
                    this.shared.data.players = data;
                    this.shared.player = this.shared.getPlayer();
                    this.shared.faction = this.shared.getFaction();
                });

                // listen for resource update
                this.shared.socket.on( 'updateResources', data => {
                    data.forEach( item => {
                        this.shared.data.factions[ item.faction ].resources = item.resources;
                        this.shared.data.factions[ item.faction ].energy = item.energy;
                    });
                });

                // listen for points update
                this.shared.socket.on( 'updatePoints', data => {
                    data.forEach( item => {
                        this.shared.data.factions[ item.faction ].pp = item.pp;
                        this.shared.data.factions[ item.faction ].ap = item.ap;
                    });
                });
            },


            /**
             * Watch our socket for a disconnected status
             */
            watchDisconnected(){
                // if we are no longer disconnected, do nothing
                if( !this.shared.socket.disconnected ) return;

                // wait x seconds on a disconnection, if we haven't connected again yet by the time we
                // are done waiting then cleat the game and return to the lobby
                let _this = this;
                setTimeout( function(){
                    if( !_this.shared.socket || _this.shared.socket.disconnected ) {
                        _this.clearGame();
                    }
                }, this.disconnectionWait * 1000 );

            },


            /**
             * Watch our shared game for any time we don't have a playerIndex or factionName property
             * and regenerate those properties
             */
            watchSharedGame(){
                if( this.shared.playerIndex === null ){
                    this.setPlayerIndex()
                }

                if( this.shared.factionName === null ){
                    this.setPlayerFactionName()
                }
            },


            /**
             * Set our player index based on the playerOrder
             *
             * @returns {null}
             */
            setPlayerIndex(){
                if( ! this.shared.data || ! this.shared.data.playerOrder ) return null;

                this.shared.data.playerOrder.forEach( ( playerId, index ) => {
                    if( playerId === this.shared.id ) this.shared.playerIndex = index;
                });
            },


            /**
             * Set our faction name based on our game factions data
             *
             * @returns {null}
             */
            setPlayerFactionName(){
                if( this.shared.playerIndex === null || ! this.shared.data.factions ) return null;

                let faction = null;
                _.forEach( this.shared.data.factions, ( factionData, factionName ) => {
                    if( factionData.owner === this.shared.playerIndex ) this.shared.factionName = factionName;
                });
            },


            /**
             * Clear all game data from our shared data
             */
            clearGame(){
                this.shared.data = null;
                this.shared.faction = null;
                this.shared.factionName = null;
                this.shared.player = null;
                this.shared.game = null;
                this.shared.lobbyPlayers = {};
                this.shared.saveGames = [];
                this.shared.actions = null;
                this.shared.openSettings = false;
                this.shared.action = null;
                this.shared.card = null;
                this.shared.token = null;
                this.shared.showXavier = false;
                this.shared.viewDiscard = false;
            },
        }
    }
</script>


<style>

</style>

