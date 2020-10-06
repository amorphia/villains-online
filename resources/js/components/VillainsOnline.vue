<template>
    <div class="villains-online d-flex align-stretch main-container pos-relative">
        <div class="main-content height-100 drawer__main" :class="{'drawer--closed' : chatClosed}">
            <game-lobby v-if="!shared.data"></game-lobby>
            <choose-factions v-else-if="shared.data.state == 'choose-factions'"></choose-factions>
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
            };
        },

        watch : {
            'shared.socket.disconnected' : function(){
                if( this.shared.socket.disconnected ) {

                    console.log( 'disconnection detected' );
                    let _this = this;

                    setTimeout( function(){
                        if( !_this.shared.socket || _this.shared.socket.disconnected ) {
                            console.log( 'disconnection confirmed' );
                            _this.clearGame();
                        }
                    }, 3000 );
                }
            },

              'shared.game' : function(){
                  if( this.shared.playerIndex === null ){
                      this.setPlayerIndex()
                  }

                  if( this.shared.factionName === null ){
                      this.setPlayerFactionName()
                  }
              },
        },

        created(){

            console.log( 'Villians Online initializing in env:', process.env.MIX_APP_ENV );

            this.shared.id = App.user.uuid;
            this.shared.name = App.user.name;
            this.shared.admin = App.user.admin;
            this.initSocket();
            this.initCoreSocketFunctions();

            this.shared.init( 'event', App.event );

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

            setPlayerIndex(){
                if( ! this.shared.data || ! this.shared.data.playerOrder ) return null;
                let playerIndex = null;

                this.shared.data.playerOrder.forEach( ( value, index ) => {
                    if( value === this.shared.id ){
                        playerIndex = index;
                    }
                });
                this.shared.playerIndex = playerIndex;
            },

            setPlayerFactionName(){
                if( this.shared.playerIndex === null || ! this.shared.data.factions ) return null;

                let faction = null;
                _.forEach( this.shared.data.factions, ( value, prop ) => {
                    if( value.owner == this.shared.playerIndex ){
                        faction = prop;
                    }
                });

                this.shared.factionName = faction;
            },

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

            initCoreSocketFunctions(){

                // try to reconnect on disconnect
                this.shared.socket.on( 'disconnect', () => {

                    let socket = this.shared.socket;

                    setTimeout(() => {
                        socket.connect();
                        socket.emit( 'newPlayer', {
                            name : App.user.name,
                            id : App.user.uuid
                        });
                    }, 1000 );

                });

                // listen for open games
                this.shared.socket.on( 'openGame', game => {
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

            initSocket(){
                let socket = io( App.server );
                this.shared.init( 'socket', socket );

                this.shared.socket.emit( 'newPlayer', {
                    name : App.user.name,
                    id : App.user.uuid
                });
            },

        }
    }
</script>


<style>

</style>

