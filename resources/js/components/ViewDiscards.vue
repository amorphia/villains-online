<template>
    <transition name="right">
        <div v-if="shared.viewDiscard" class="view-discard pos-absolute width-100 height-100 p-5 overflow-auto z-3 top-0">
            <!-- close button -->
            <button class="toggle fixed top right icon-x"
                    @click="shared.viewDiscard = false"
            ></button>

            <!-- info bar -->
            <div class="title">Cards in Deck: {{ shared.data.deckCount }} ({{ shuffleMessage }})</div>
            <div class="spacer mt-4">&nbsp;</div>

            <!-- discard pile -->
            <div class="title">Discard Pile</div>
            <div v-if="shared.data.discard.length" class="d-flex flex-wrap justify-center pt-4">
                <img v-for="card in sortedDiscard"
                     @click="shared.card = `/images/cards/${card.file}.jpg`"
                     :src="`/images/cards/${card.file}.jpg`"
                     class="view-discard__card">
            </div>
            <div v-else class="view-player__empty">Discard Pile Empty</div>
        </div>
    </transition>
</template>


<script>
    export default {

        name: 'view-discards',

        data() {
            return {
                shared : App.state,
            };
        },

        computed : {
            // Sorts our discard pile by name
            sortedDiscard(){
                return this.shared.data.discard.sort( (a,b) => (a.file < b.file) ? -1 : (a.file > b.file) ? 1 : 0 );
            },

            // sets our shuffle message to alert players if the deck has been shuffled yet this game
            shuffleMessage(){
                return this.shared.data.reshuffled ? 'Reshuffled' : 'Never Reshuffled';
            }
        },

        watch : {
            // whenever we open or close this panel play our little UI click sound
            "shared.viewDiscard" : function(){
                App.event.emit( 'sound', 'ui' );
            }
        },
    }
</script>


<style>

    .view-discard {
        background-image : url('/images/factory-background.jpg');
        background-position: center;
        background-size: cover;
    }

    .view-discard__card {
        width: 13rem;
        border-radius: 11%/8%;
        border: 2px solid rgba(0,0,0,.2);
        margin: 0 .4rem;
        cursor: pointer;
    }


</style>

