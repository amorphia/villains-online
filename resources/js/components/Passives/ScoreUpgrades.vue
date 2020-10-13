<template>
    <player-prompt classes="">
        <div class="place-token px-5">

            <div v-for="upgrade in data.upgrades" class="p-3">
                <div class="title flex-center "><img class="determine-control__faction-icon" :src="factionIcon( upgrade.faction )">
                    upgrade scored by The {{ upgrade.faction | startCase }}
                </div>

                <div class="width-100 d-flex justify-center mt-4">
                    <div class="flex-center">
                        <img class="score-upgrade__image" :src="`/images/factions/${upgrade.faction}/upgrade-${upgrade.upgrade}.jpg`">
                    </div>
                </div>
            </div>

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
            this.interval = setInterval( this.incrementIndex, this.data.slideSpeed * 1000 );
            App.event.emit( 'sound', 'coin' );
        },

        methods : {
            resolve(){
                this.shared.respond( 'score-upgrades', {} );
            },

            factionIcon( factionName ){
                return _.factionIcon( factionName );
            },
        },

        computed : {

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

