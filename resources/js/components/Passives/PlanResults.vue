<template>
    <player-prompt classes="">
        <div class="place-token px-5">

            <div class="title flex-center "><img class="determine-control__faction-icon" :src="factionIcon( currentFactionName )">
                plans scored by The {{ currentFactionName | startCase }}
            </div>

            <div class="width-100 d-flex justify-center mt-4">
                <div v-if="currentScoredPlans.length" class="d-flex">
                    <plan-block v-for="plan in currentScoredPlans" :plan="plan" :key="plan.plan.id" :faction="currentFaction"></plan-block>
                </div>
                <div v-else class="primary-light no-plans-scored py-5">
                    The {{ currentFactionName | startCase }} did not score any plans
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'plan-results',
        data() {
            return {
                shared : App.state,
                index : 0,
                interval : null
            };
        },

        mounted() {
            this.interval = setInterval( this.incrementIndex, this.data.slideSpeed * 1000 );
            this.checkForAPSound();
        },

        methods : {

            checkForAPSound(){
                if( this.currentScoredPlans.length ){
                    App.event.emit( 'sound', 'points' );
                } else {
                    App.event.emit( 'sound', 'chirp' );
                }
            },

            factionIcon( factionName ){
                return _.factionIcon( factionName );
            },

            incrementIndex(){
                if( !this.data || !this.data.results || this.index === this.data.results.length - 1 ){
                    clearInterval( this.interval );
                    return;
                }

                this.index++;
                this.checkForAPSound();
            }
        },

        computed : {


            currentFactionName(){
                return this.data.results[this.index].faction;
            },

            currentFaction(){
                return this.shared.data.factions[ this.currentFactionName ];
            },

            currentScoredPlans(){
                return this.data.results[this.index].plans.filter( plan => plan.selected );
            },

            data(){
                return this.shared.player.prompt.data;
            },

        },


    }
</script>


<style>

    .no-plans-scored {
        font-size: 1.5rem;
    }


</style>

