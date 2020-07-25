<template>
    <hud-popout :open="open" classes="cards-hud" @close="$emit( 'close')">
        <horizontal-scroll classes="cards-hud__cards height-100" buttons="true">
            <div class="cards-hud__card d-inline-block height-100"
                 v-for="card in shared.faction.cards.hand"
                 @click="itemClicked( card )">
                <img class="cards-hud__card-image height-100" :src="`/images/cards/${card.file}.jpg`">
            </div>
        </horizontal-scroll>
    </hud-popout>
</template>


<script>

    export default {

        name: 'cards-hud',

        props: ['open'],
        data() {
            return {
                shared : App.state,
            };
        },


        methods : {
            itemClicked( item ) {

            },
        }
    }
</script>


<style>
    .cards-hud {
        height: 40vh;
    }

    .cards-hud__card {
        padding: .5rem .3rem;
    }

    .cards-hud__card-image {
        border-radius: 8%;
    }
</style>

