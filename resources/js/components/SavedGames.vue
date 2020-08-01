<template>

    <div class="saved-games game-hud drawer__aside height-100 pt-4">
        <adjust-handle direction="right" max="600" min="125"></adjust-handle>
        <div class="width-100 height-100  flex-column d-flex">
            <save-game v-for="save in shared.savedGames" :key="save.id" :save="save"></save-game>
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

        mounted(){
            this.getSavedGames();
        },

        methods : {

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

