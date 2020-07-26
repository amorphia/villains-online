<template>
    <transition name="right">
        <div v-if="shared.viewDiscard" class="view-discard pos-absolute width-100 height-100 p-5 overflow-auto z-3">
            <button class="toggle fixed top right icon-x"
                    @click="shared.viewDiscard = false"
            ></button>

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
            sortedDiscard(){
                return this.shared.data.discard.sort( (a,b) => (a.file < b.file) ? -1 : (a.file > b.file) ? 1 : 0 );
            }
        },

        watch : {
            "shared.viewDiscard" : function(){
                App.event.emit( 'sound', 'ui' );
            }
        },

        methods : {
        }
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

