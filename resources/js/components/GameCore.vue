<template>
    <div class="main-content height-100 drawer__main pos-relative d-flex flex-column align-stretch">
        <game-display></game-display>
        <game-controls v-if="shared.player && !shared.player.isSpectator"></game-controls>
        <!-- leave button -->
        <div v-else class="d-flex justify-center">
            <button class="button" @click="stopWatching">STOP WATCHING</button>
        </div>
    </div>
</template>


<script>

    export default {
        name: 'game-core',

        data() {
            return {
                shared : App.state,
            };
        },

        created(){
            // set our player data
            this.shared.player = this.shared.getPlayer();
            // set our faction data
            this.shared.faction = this.shared.getFaction();
        },

        methods: {
            stopWatching(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'stopWatchingGame', this.shared.data.id );
            }
        },

        watch : {
            /**
             * Play "you are the active player" sound each time we become the active player
             */
            'shared.player.active' : {
                handler( newValue, oldValue ) {
                    // if we are now active, and we weren't before
                    if( newValue === true && oldValue !== true ) App.event.emit( 'sound', 'active' );
                }
            },
        },
    }
</script>



