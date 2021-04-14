<template>
    <player-prompt classes="">
        <div class="place-token px-5">

            <div class="title flex-center "><img class="determine-control__faction-icon" :src="shared.factionIcon( currentFactionName )">
                upgrade scored by The {{ currentFactionName | startCase }}
            </div>

            <div class="width-100 d-flex justify-center mt-4">
                <div class="flex-center">
                    <img class="score-upgrade__image" :src="`/images/factions/${currentFactionName}/upgrade-${currentUpgrade}.jpg`">
                </div>
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
                index : 0,
                interval : null,
            };
        },

        mounted() {
            this.interval = setInterval( this.incrementIndex, this.data.slideSpeed * 1000 );
            App.event.emit( 'sound', 'coin' );
        },

        methods : {

            incrementIndex(){
                if( !this.data || !this.data.upgrades || this.index === this.data.upgrades.length - 1 ) {
                    clearInterval( this.interval );
                    return;
                }

                this.index++;
                App.event.emit( 'sound', 'coin' );
            }
        },

        computed : {

            currentFactionName(){
                return this.data.upgrades[this.index].faction;
            },

            currentFaction(){
                return this.shared.data.factions[ this.currentFactionName ];
            },

            currentUpgrade(){
                return this.data.upgrades[this.index].upgrade;
            },

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

