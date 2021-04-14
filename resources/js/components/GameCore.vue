<template>
    <div class="main-content height-100 drawer__main pos-relative d-flex flex-column align-stretch">
        <game-display></game-display>
        <game-controls></game-controls>
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



