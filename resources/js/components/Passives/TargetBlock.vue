<template>
    <div class="target-block d-flex flex-column align-center">
        <div class="target-block__placer one-line" :class="`faction-${target.placer}`">The {{ target.placer | startCase }} Target:</div>
            <div class="target-block__card-container">
                <img class="target-block__card target-block-reveal" :class="{revealed : target.flipped}" :src="image">
            </div>
            <div class="target-block-reveal mt-4" :class="{revealed : target.flipped}">
                <div v-if="target.owner" class="center-text">
                    <div class="one-line" :class="`faction-${target.owner}`">Taken by The {{ target.owner | startCase }}</div>
                    <img class="target-block__ap-icon" src="/images/icons/ap-1.png">
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
            'target.flipped' : function(){
                if( this.target.flipped ){
                    this.checkForAPSound();
                }
            }
        },

        computed : {
            image(){
                return `/images/cards/${this.target.file}.jpg`;
            }
        },

        methods : {
            checkForAPSound() {
                if (this.target.owner) {
                    App.event.emit('sound', 'points');
                } else {
                    App.event.emit('sound', 'chirp');
                }
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

