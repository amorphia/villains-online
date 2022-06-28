<template>
    <div class="saved-games game-hud drawer__aside height-100 pt-4 z-4">
        <!-- active games -->
        <active-games></active-games>

        <template v-if="shared.admin">
            <!-- title -->
            <div class="highlight secondary-font center-text pb-4">saved games</div>

            <!-- saved games container -->
            <div class="width-100 height-100  flex-column d-flex pb-5 overflow-auto">
                <div>
                    <save-game v-for="(save, index) in shared.savedGames"
                               :open="open === index"
                               :index="index"
                               :key="save.id"
                               :save="save"
                               @open="openSave">
                    </save-game>
                </div>
            </div>
        </template>
    </div>

</template>


<script>
    export default {

        name: 'saved-games',

        data() {
            return {
                shared : App.state,
                savedGames : {},
                open : -1
            };
        },

        mounted(){
            this.getSavedGames();
        },

        methods : {

            /**
             * Open the saved game at index x
             *
             * @param index
             */
            openSave( index ){
                // if this save is already open toggle it closed
                if( this.open === index ){
                    this.open = -1;
                    return;
                }

                // otherwise open the given index
                this.open = index;
            },


            /**
             * Load our saved games
             */
            getSavedGames(){
                axios.get( `/game` )
                    .then( response => {
                        this.shared.savedGames = response.data;
                    })
                    .catch( errors => console.log( errors ) );
            },
        }

    }
</script>

