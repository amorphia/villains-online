<template>
    <div @click="confirmEndGame">
        <slot></slot>
    </div>
</template>


<script>
    export default {

        name: 'end-game',

        data() {
            return {
                shared : App.state
            };
        },

        methods : {
            confirmEndGame(){
                let confirmMessage = "are you sure you want to conclude this game? There's No going back.";
                if( confirm( confirmMessage ) ) this.concludeGame();
            },

            concludeGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'concludeGame' );
                this.shared.openSettings = false;
            }
        }
    }
</script>


<style>

</style>

