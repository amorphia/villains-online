<template>
    <div @click="confirmEndGame">
        <slot></slot>
    </div>
</template>


<script>
    export default {

        name: 'end-game',
        props: ['track'],

        data() {
            return {
                shared : App.state
            };
        },

        methods : {

            /**
             * Allow a player to confirm if they really want to end the game
             */
            confirmEndGame(){
                let confirmMessage = this.track ?
                    "Conclude this game early and go to final scoring?"
                    : "are you sure you want to terminate this game? There's No going back.";

                if( confirm( confirmMessage ) ) this.concludeGame();
            },


            /**
             * Resolve concluding the game
             */
            concludeGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'concludeGame', this.track );
                this.shared.openSettings = false;
            }
        }
    }
</script>


<style>

</style>

