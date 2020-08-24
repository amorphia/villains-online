<template>
    <div class="title-card">
        <div class="title">
            TURN {{ shared.data.turn }}
            <div v-if="data.showDoubleAP" class="prompt-question">TARGETS WORTH 2AP</div>
        </div>

        <div class="title-card__message">{{ data.message }}</div>
    </div>
</template>


<script>
    export default {

        name: 'title-card',
        data() {
            return {
                shared : App.state,
            };
        },

        mounted(){
            App.event.emit( 'sound', 'chirp' );
        },

        computed : {
            data(){
                return this.shared.player.prompt.data;
            },
        },


    }
</script>


<style>
    .title-card {
        background-image: url("/images/background-blurred.jpg");
        background-position: center;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        box-shadow: inset 0 0 15px rgba(0,0,0,.5),
                    0 0 0px 3px rgba(255,103,149,.75),
                    0 0 0px 8px rgba(0,0,0,1),
                    0px 0px 6px rgba(0,0,0,.5);
        position: absolute;
        right: 50%;
        top: 50%;
        transform: translate(50%,-50%);
        max-width: 95%;
        max-height: 98%;
        padding: 5rem;
        text-transform: uppercase;
        z-index: 3;
        color: #ffff2a;
        text-shadow: 0 0 5px var(--highlight-color);
        letter-spacing: .1em;
        white-space: nowrap;
    }

    .title-card__message {
        font-size: 5rem;
    }

</style>

