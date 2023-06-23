<template>
    <div class="saved-games game-hud drawer__aside height-100 pt-4 z-4 d-flex flex-column">
        <!-- active games -->
        <active-games></active-games>
        <div class="grow-1 shrink-1 overflow-hidden">
            <template v-if="shared.admin">

                    <!-- title -->
                    <div class="highlight secondary-font center-text pb-4">saved games</div>

                    <!-- saved games container -->
                    <div class="width-100 height-100 flex-column d-flex pb-5 overflow-auto">
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

        <div class="control-panel p-3 grow-0 shrink-0 d-flex align-stretch highlight flex-wrap lobby-controls">
            <!-- DECK AND DISCARDS -->
            <div class="d-inline stat-icon highlight pointer"
                 title="view factions" @click="openFactions">
                <i class='icon-blown-cover'></i> <span>factions</span>
            </div>

            <!-- GAME OPTIONS BUTTON -->
            <a href="/files/villains_v4.3_web.pdf" target="_blank" class="d-inline stat-icon highlight pointer">
                <i class='icon-plans' title="view game rules"></i> <span>rules</span>
            </a>

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

            openFactions(){
                this.shared.event.emit( 'viewFactions' );
            },
        }

    }
</script>

<style scoped>
    .lobby-controls span {
        font-size: .7rem;
        text-transform: uppercase;
        font-family: 'Oswald', sans-serif;
        margin: 0 .25rem;
    }

    .lobby-controls .stat-icon {
        padding: .4rem .1rem;
    }

</style>
