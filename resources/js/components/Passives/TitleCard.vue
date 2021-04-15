<template>
    <div class="title-card">
        <!-- turn -->
        <div class="title">
            TURN {{ shared.data.turn }}
            <div v-if="data.showDoubleAP" class="prompt-question">TARGETS WORTH 2AP</div>
        </div>

        <!-- title message -->
        <div class="title-card__message">{{ data.message }}</div>

        <!-- show neutral area on the first turn -->
        <div v-if="showNeutral" class="choose-factions__player pull-center d-flex align-stretch">
            <div class="choose-factions__player-faction width-15 d-flex pr-2">
                <img class="choose-spy__champion" :src="`/images/factions/neutral/icon.jpg`" >
            </div>
            <div class="choose-factions__player-name ellipses p-4">Neutrals control <b>The {{ showNeutral || startCase }}</b></div>
        </div>

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
            /**
             * return prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },


            /**
             * Should we show the neutral controlling an area?
             * @returns {string|false}
             */
            showNeutral(){
                if( this.data.type !== 'turn' ) return false;

                // get the neutral area if any
                let neutralArea = Object.values( this.shared.data.areas ).find( area => area.owner === 'neutral' );

                // return that area's name, or false
                return neutralArea ? neutralArea.name : false;
            }

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

