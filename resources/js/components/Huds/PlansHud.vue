<template>
    <hud-popout :open="open" classes="plans-hud" @close="$emit( 'close')">
        <horizontal-scroll classes="plans-hud__cards height-100" >
            <div class="plans-hud__card d-inline-block height-100"
                 v-for="card in shared.faction.plans.current"
                 @click="itemClicked( card )">
                <img class="plans-hud__card-image height-100" :src="`/images/factions/${shared.faction.name}/plans/${card.num}.jpg`">
            </div>
        </horizontal-scroll>
    </hud-popout>
</template>


<script>

    export default {

        name: 'plans-hud',

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
    .plans-hud {
        height: 45vh;
    }

    .plans-hud__card {
        padding: .5rem .3rem;
    }

    .plans-hud__card-image {
        border-radius: 8%;
    }
</style>
