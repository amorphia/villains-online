<template>
    <player-prompt classes="">
        <div class="flex-center">
            <button class="button button-empty" @click="submit( false )">NO</button>
            <button class="button" @click="submit( true )">YES</button>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'yes-no',

        data() {
            return {
                shared : App.state
            };
        },

        methods : {
            submit( val ){
                this.shared.respond('yes-no', 'test', val );
            }
        }
    }
</script>


<style>

</style>

