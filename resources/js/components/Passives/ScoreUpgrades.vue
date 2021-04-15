<template>
    <player-prompt classes="">
        <div class="place-token px-5">

            <!-- upgrades by faction -->
            <div v-for="upgrade in data.upgrades" class="p-3">

                <!-- title -->
                <div class="title flex-center "><img class="determine-control__faction-icon" :src="shared.factionIcon( upgrade.faction )">
                    upgrade scored by The {{ upgrade.faction | startCase }}
                </div>

                <!-- upgrade card -->
                <div class="width-100 d-flex justify-center mt-4">
                    <div class="flex-center">
                        <img class="score-upgrade__image" :src="`/images/factions/${upgrade.faction}/upgrade-${upgrade.upgrade}.jpg`">
                    </div>
                </div>
            </div>

            <!-- done button -->
            <div class="center-text">
                <button class="button" @click="resolve">Done</button>
            </div>

        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'score-upgrades',
        data() {
            return {
                shared : App.state,
            };
        },

        mounted() {
            App.event.emit( 'sound', 'coin' );
        },

        methods : {
            /**
             * Close prompt
             */
            resolve(){
                this.shared.respond( 'score-upgrades', {} );
            },
        },

        computed : {
            /**
             * return prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },
        },
    }
</script>


<style>
    .score-upgrade__image {
        width: 25rem;
        border: .2rem solid rgba(0,0,0,.2);
        margin: .5rem;
    }
</style>

