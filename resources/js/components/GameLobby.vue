<template>
    <div class="d-flex flex-center height-100 pos-relative">


        <!-- saved games -->
        <saved-games></saved-games>

        <!-- main content -->
        <div class="d-flex flex-center width-100 height-100 pos-relative">


            <!-- view faction sheets modal -->
            <view-factions></view-factions>

            <!-- TOP BAR -->
            <div class="d-flex justify-between width-100 pos-absolute top-0 left-0 right-0 px-4 pt-2">
                <!-- logout button -->
                <a href="/logout" class="lobby__action-link  ml-auto right-text">logout</a>
            </div>

            <!-- lobby players -->
            <div class="lobby__players pos-absolute left-0 top-0 bottom-0 bg-shadow-3">
                <div v-for="player in sortedLobbyPlayers" class="lobby__player d-flex align-center" :class="{ admin: player.admin}">
                    <i v-if="player.admin" class="icon-influence mr-1"></i>{{ player.name }}
                </div>
            </div>

            <!-- open game join/settings -->
            <div v-if="shared.game" class="open-game glass width-40">

                <!-- game id -->
                <div class="d-flex align-center open-game__id text-uppercase justify-between">
                    <div>Game Id <span>{{ shared.game.id }}</span></div>

                    <!-- delete game -->
                    <div v-if="shared.admin" class="icon-x open-game__delete pointer" @click="deleteGame"></div>
                </div>

                <!-- players -->
                <div class="open-game__players-title text-uppercase">Players</div>

                <div class="open-game__players">
                    <div v-for="player in shared.game.players" class="d-flex justify-center align-center">
                        <span class="d-flex align-center" :class="{gold : player.admin}">
                           <i v-if="player.admin" class="icon-influence mr-1"></i> {{ player.name | startCase }}
                        </span>
                        <i
                            v-if="gameCreator && player.id !== shared.id"
                            @click="removePlayer(player)"
                            class="icon-x pointer pl-2 choose-factions__block pos-relative"
                        ></i>
                    </div>
                    <div v-if="Object.keys(shared.game.players).length === 0" class="open-game__empty">No Players</div>
                </div>

                <!-- game type -->
                <div v-if="shared.admin" class="game-setup__type d-flex justify-center">
                    <div v-if="shared.game.gameType === type || gameCreator" v-for="type in gameTypes"
                         class="game-setup__type-option"
                         :class="{ active : shared.game.gameType === type }"
                         @click="setGameType( type )"
                    >{{ type }}</div>
                </div>


                <!-- game options -->
                <div v-if="shared.admin && gameCreator" class="game-setup__options d-flex justify-center my-2">
                    <div v-for="(val, option) in options"
                         class="game-setup__option py-2 px-3"
                         :class="{ active : val }"
                         @click="options[option] = !options[option]"
                    ><i class="mr-2 game-setup__option-checkbox"
                        :class="val ? 'icon-checkbox-checked' : 'icon-checkbox-unchecked'"></i>{{ alphaCaps( option ) }}</div>
                </div>

                <!-- join/leave/start buttons -->
                <div class="open-game__buttons center-text">
                    <button v-if="!joinedGame" :disabled="!canJoin" class="button wide px-6" @click="joinGame">JOIN</button>
                    <button v-if="joinedGame" class="button wide px-6 button-empty" @click="leaveGame">LEAVE</button>
                    <button v-if="joinedGame && shared.admin" :disabled="!canStart" class="button wide px-6" @click="startGame">START</button>
                </div>
            </div>

            <!-- no open game -->
            <div v-else>

                <!-- server offline -->
                <div v-if="shared.socket.disconnected" class="server-offline">
                    <i class="icon-kill"></i>SERVER OFFLINE
                </div>

                <!-- new game button -->
                <button v-else-if="shared.admin" @click="newGame" class="button new-game-button">Create New Game</button>

                <div v-else class="server-offline">WAITING FOR GAME</div>
            </div>
        </div>
    </div>
</template>


<script>

    export default {

        name: 'game-lobby',
        data() {
            return {
                shared : App.state,
                // game types
                gameTypes : [
                    'basic',
                    'optimized',
                    'anarchy',
                    'secret',
                ],
                // game options
                options : {
                    allowBribes : false
                }
            };
        },

        mounted(){
            // pre-load faction images for selected faction
            this.shared.socket.on( 'factionSelected', faction => App.preloader.loadFaction( faction ) );
        },

        computed : {

            gameCreator(){
                return this.shared.game.creator === this.shared.id
            },

            /**
             * returns the number of players currently in the game
             * returns {number}
             */
            currentPlayerCount(){
                return Object.keys( this.shared.game?.players ).length;
            },


            sortedLobbyPlayers(){
                return Object.values(this.shared.lobbyPlayers)
                    .sort( (a,b) => {
                        if(a.admin && !b.admin) return -1;
                        if(b.admin && !a.admin) return 1;
                        return a.name > b.name ? -1 : 1;
                    });
            },

            /**
             * can another player join the game?
             * returns {boolean}
             */
            canJoin(){
                // if we have less than 5 players
                return this.currentPlayerCount < 5;
            },


            /**
             * Can the game start?
             * returns {boolean}
             */
            canStart(){
                // if we have between 2-5 players
                  return this.currentPlayerCount >= 2 && this.currentPlayerCount <= 5;
            },


            /**
             * Have we joined the open game?
             * returns {boolean}
             */
            joinedGame(){
                for( let player in this.shared.game.players ){
                    if( this.shared.game.players[player].id === this.shared.id ) return true;
                }
                return false;
            }
        },

        methods : {
            /**
             * Transforms a string to start case (to remove underscores and separate camel case words),
             * then transforms string to uppercase
             *
             * @param str
             * @returns {string}
             */
            alphaCaps( str ){
               return _.startCase( str ).toUpperCase();
            },


            /**
             * Emits view factions event
             */
            openFactions(){
                this.shared.event.emit( 'viewFactions' );
            },

            removePlayer(player){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'leaveGame', this.shared.game.id, player );
            },

            /**
             * Sets the currently open game type
             *
             * @param type
             */
            setGameType( type ){
                // only the game's creator can change the type
                if( !this.gameCreator ) return App.event.emit( 'sound', 'error' );

                // set game type
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'setGameType', this.shared.game.id, type );
            },


            /**
             * Initialize a new game
             */
            newGame() {
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit('newGame');
            },


            /**
             * Join the open game
             */
            joinGame(){
                // pre-load core images
                App.preloader.loadCore();

                // join game
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'joinGame', this.shared.game.id );
            },


            /**
             * Leave the open game
             */
            leaveGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'leaveGame', this.shared.game.id );
            },


            /**
             * Delete the open game
             */
            deleteGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'deleteGame', this.shared.game.id );
            },


            /**
             * Start the open game
             */
            startGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'startGame', this.shared.game.id, this.options );
            },

        }
    }
</script>


<style>
    .lobby__action-link {
        color: var(--highlight-color);
        width: 20em;
    }


    .server-offline {
        padding: 2rem;
        display: flex;
        align-items: baseline;
        font-size: 1.75em;
        background-color: rgba(17, 7, 19, 0.9);
        border-radius: .2em;
        border-top: 1px solid rgba(91, 33, 128, 0.56);
        letter-spacing: 2px;
        color: var(--highlight-color);
        box-shadow: 0 0 2px rgba(91,33,120,.5), 0 4px 5px rgba(0,0,0,.2);
    }

    .server-offline i {
        color: red;
        font-size: .9em;
        position: relative;
        top: 3px;
        margin-right: .5rem;
    }

    .game-setup__option {
        font-size: .8em;
    }

    .game-setup__type-option {
        cursor: pointer;
        margin: .3em;
    }

    .game-setup__type-option.active, .game-setup__option.active {
        color: var(--highlight-color);
    }

    .game-setup__option-checkbox{
        font-size: .8em;
    }

    .lobby__players {
        display: flex;
        flex-direction: column;
        gap: .25rem;
        align-items: start;
        padding: 1rem;
        width: 10rem;
        text-transform: capitalize;
    }

    .lobby__player.admin {
        color: gold;
    }

</style>

