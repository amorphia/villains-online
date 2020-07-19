<template>
    <div class="d-flex flex-center height-100 pos-relative">

        <a href="/logout" class="pos-absolute top-0 right-0 m-4 logout-link">logout</a>

        <saved-games v-if="shared.admin"></saved-games>

        <div v-if="shared.game" class="open-game glass width-40">
            <div class="d-flex align-center open-game__id text-uppercase justify-between">
                <div>Game Id <span>{{ shared.game.id }}</span></div>
                <div class="icon-x open-game__delete pointer" @click="deleteGame"></div>
            </div>
            <div class="open-game__players-title text-uppercase">Players</div>
            <div class="open-game__players">
                <div v-for="player in shared.game.players">{{ player.name | startCase }}</div>
                <div v-if="Object.keys(shared.game.players).length === 0" class="open-game__empty">No Players</div>
            </div>
            <div class="open-game__buttons center-text">
                <button v-if="!joinedGame" class="button wide px-6" @click="joinGame">JOIN</button>
                <button v-if="joinedGame" class="button wide px-6 button-empty" @click="leaveGame">LEAVE</button>
                <button v-if="joinedGame" class="button wide px-6" @click="startGame">START</button>
            </div>
        </div>
        <div v-else class="">
            <button @click="newGame" class="button new-game-button">Create New Game</button>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'game-lobby',
        data() {
            return {
                shared : App.state
            };
        },

        mounted(){
            this.shared.socket.on( 'factionSelected', faction => App.preloader.loadFaction( faction ) );
        },

        computed : {
            joinedGame(){
                for( let player in this.shared.game.players ){
                    if( this.shared.game.players[player].id === this.shared.id ) return true;
                }
            }
        },

        methods : {
            newGame() {
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit('newGame');
            },

            joinGame(){
                App.event.emit( 'sound', 'ui' );
                App.preloader.loadCore();
                this.shared.socket.emit( 'joinGame', this.shared.game.id );
            },

            leaveGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'leaveGame', this.shared.game.id );
            },

            deleteGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'deleteGame', this.shared.game.id );
            },

            startGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'startGame', this.shared.game.id );
            },


        }
    }
</script>


<style>
    .logout-link {
        font-size: 1.5rem;
        color: var(--highlight-color);
    }
</style>

