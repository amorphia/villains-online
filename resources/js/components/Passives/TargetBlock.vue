<template>
    <div class="target-block d-flex flex-column align-center">

        <!-- title -->
        <div class="target-block__placer one-line" :class="`faction-${target.placer}`">The {{ target.placer | startCase }} Target:</div>

        <!-- image -->
        <div class="target-block__card-container">
            <img class="target-block__card target-block-reveal" :class="{revealed : target.flipped}" :src="image">
        </div>

        <!-- owner -->
        <div class="target-block-reveal mt-4" :class="{revealed : target.flipped}">
            <div v-if="target.owner" class="center-text">
                <div class="one-line" :class="`faction-${target.owner}`">Taken by The {{ target.owner | startCase }}</div>
                <div v-if="target.stolen" class="one-line highlight">Ol' Zeke shares the score</div>
                <img class="target-block__ap-icon" :src="`/images/icons/ap-1.png`">
            </div>
            <div v-else class="center-text primary-light">Uncontrolled</div>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'target-block',
        props : ['target'],

        data() {
            return {
                shared : App.state
            };
        },

        watch: {
            // when the target flips over, play a sound
            'target.flipped' : function(){
                if( this.target.flipped ){
                    this.checkForAPSound();
                }
            }
        },

        computed : {
            // Return the url for this target's card image
            image(){
                return `/images/cards/${this.target.file}.jpg`;
            }
        },

        methods : {

            checkForAPSound() {
                // if someone scored points for this play the points sound
                if ( this.target.owner ) {
                    App.event.emit('sound', 'points');
                    return;
                }

                // otherwise just play the normal chirp
                App.event.emit('sound', 'chirp');
            },
        }
    }
</script>


<style>
    .target-block {
        width: 13.5rem;
        padding: .5rem;
        font-size: 1.6rem;
    }

    .target-block-reveal {
        opacity: 0;
        transition: opacity .3s;
    }

    .target-block-reveal.revealed {
        opacity: 1;
    }

    .target-block__ap-icon {
        width: 5rem;
    }

    .target-block__card-container {
        position: relative;
        overflow: hidden;
        border-radius: 8%;
        box-shadow: 0 0 5px rgba(0,0,0,1);
    }

    .target-block__card-container:after{
        content: "";
        position: absolute;
        width: 100%;
        z-index: -1;
        top: 0;
        left: 0;
        background-image: url(/images/cards/back.jpg);
        height: 100%;
        background-size: cover;
    }

    .target-block__card {
        overflow: hidden;
        border-radius: 8%;
        margin-bottom: -.5em;
        z-index: 2;
    }

</style>

