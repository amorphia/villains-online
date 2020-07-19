<template>
    <div class="saved-games">
        <div v-for="game in savedGames" class="d-flex" @click="loadGame( game['game_id'] )">
            <div class="primary-light">{{ gameDate( game ) }}</div>
            <div class="highlight ml-3">{{ game['save_type'] }}</div>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'saved-games',

        data() {
            return {
                shared : App.state,
                savedGames : {},
            };
        },

        created(){
            this.shared.socket.on( 'savedGames', savedGames => this.savedGames = savedGames);
        },

        methods : {
            loadGame( gameId ){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'loadGame', gameId );
            },
            gameDate( game ){
                return Moment( game.created ).format("LLL");
            }
        }

    }
</script>


<style>
    .saved-games {
        position: absolute;
        top: 0;
        left: 0;
        padding: 1em;
    }
</style>

