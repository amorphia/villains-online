<template>

    <div class="saved-games game-hud drawer__aside height-100 pt-4 z-4">
        <div class="highlight secondary-font center-text pb-4">
            saved games
        </div>
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

            openSave( n ){
                if( this.open === n ) this.open = -1;
                else this.open = n;
            },

            getSavedGames(){
                axios.get( `/game` )
                    .then( response => {
                        console.log( response.data );
                        this.shared.savedGames = response.data;
                    })
                    .catch( errors => console.log( errors ) );
            },
        }

    }
</script>


<style>

</style>

