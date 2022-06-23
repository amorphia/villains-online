<template>

    <div v-if="shared.activeGames && shared.activeGames.length" class="">
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

