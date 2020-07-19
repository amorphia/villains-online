<template>

    <div v-if="shared.player.prompt.name" class="player-prompt z-3" :class="setClasses">

        <button @click="close" class="toggle minimize-toggle top right">
            <i :class="closed ? 'icon-maximize' : 'icon-minimize'"></i>
        </button>

        <div class="player-prompt__slot-container">
            <slot></slot>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'player-prompt',
        props : ['classes'],
        data() {
            return {
                closed : false,
                shared : App.state
            };
        },
        computed : {
            setClasses(){
                return `${this.classes} ${ this.closed ? 'closed' : '' }`;
            }
        },

        methods : {
            close(){
                this.closed = !this.closed;
                App.event.emit( 'sound', 'ui' );
            }
        }
    }
</script>


<style>

    .player-prompt {
        background-image: url("/images/background-blurred.jpg");
        background-position: center;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        box-shadow: 0px 0px 6px rgba(0,0,0,.5);
        position: absolute;
        right: 50%;
        top: 50%;
        transform: translate(50%,-50%);
        max-width: 95%;
        max-height: 98%;
        min-width: 20rem;
        padding: 0;
    }

    .player-prompt__slot-container {
        max-height: 90vh;
        width: 100%;
        overflow: auto;
        padding: 2rem 0 1rem;
        /*display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
         */
    }

    .player-prompt .minimize-toggle {
        padding: .75rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }


    .player-prompt, .player-prompt .toggle, .player-prompt__container {
        transition: all .3s;
    }

    .player-prompt__container {
        overflow: hidden;
    }

    .player-prompt.closed {
        right: 100%;
        left: unset;
        top: 0;
        transform: translate(0, 0);
    }

    .player-prompt.closed .player-prompt__container {

    }

    .player-prompt.closed .toggle {
        transform: translate(100%,0);
    }

</style>

