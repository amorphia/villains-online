<template>

    <div  v-if="shared.activeGames && shared.activeGames.length">
        <!-- title -->
        <div class="highlight secondary-font center-text pb-4">active games</div>

        <!-- saved games container -->
        <div class="width-100 height-100  flex-column d-flex pb-5 overflow-auto">
            <div>
                <active-game v-for="(game, index) in shared.activeGames"
                           :open="open === index"
                           :index="index"
                           :key="game.id"
                           :game="game"
                           @open="openSave">
                </active-game>
            </div>

        </div>
    </div>

    <div v-else class="no-active-games">NO ACTIVE GAMES</div>

</template>


<script>
    export default {

        name: 'active-games',

        data() {
            return {
                shared : App.state,
                open : -1
            };
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
        }

    }
</script>

<style scoped>
    .no-active-games {
        padding: 1rem;
        text-align: center;
        font-size: .75em;
        background-color: rgba(17, 7, 19, 0.9);
        border-radius: 0.2em;
        border-top: 1px solid rgba(91, 33, 128, 0.56);
        letter-spacing: 2px;
        color: var(--highlight-color);
        box-shadow: 0 0 2px rgb(91 33 120 / 50%), 0 4px 5px rgb(0 0 0 / 20%);
        margin: .5rem;
    }
</style>
