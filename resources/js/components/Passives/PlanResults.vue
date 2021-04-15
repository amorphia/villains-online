<template>
    <player-prompt classes="">
        <div class="place-token px-5">

            <!-- title -->
            <div class="title flex-center "><img class="determine-control__faction-icon" :src="shared.factionIcon( currentFactionName )">
                plans scored by The {{ currentFactionName | startCase }}
            </div>

            <!-- plans -->
            <div class="width-100 d-flex justify-center mt-4">

                <!-- scored plans -->
                <div v-if="currentScoredPlans.length" class="d-flex">
                    <plan-block v-for="plan in currentScoredPlans"
                                scorablePips="true"
                                :plan="plan"
                                :key="plan.plan.id"
                                :faction="currentFaction">
                    </plan-block>
                </div>
                <!-- dunce cap -->
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
                index : 0, // player index
                interval : null
            };
        },

        mounted() {
            this.interval = setInterval( this.incrementIndex, this.data.slideSpeed * 1000 );
            this.checkForAPSound();
        },

        methods : {

            checkForAPSound(){
                // if the current player scored any points play the points noise
                if( this.currentScoredPlans.length ){
                    App.event.emit( 'sound', 'points' );
                    return;
                }

                // otherwise play the default chirp
                App.event.emit( 'sound', 'chirp' );
            },


            /**
             * increment our player index
             */
            incrementIndex(){
                // clear our interval when done
                if( !this.data || !this.data.results || this.index === this.data.results.length - 1 ){
                    clearInterval( this.interval );
                    return;
                }

                // increment our index
                this.index++;
                this.checkForAPSound();
            }
        },

        computed : {
            /**
             * Returns our current faction name
             * @returns {string}
             */
            currentFactionName(){
                return this.data.results[this.index].faction;
            },


            /**
             * Returns our current faction object
             * @returns {Faction}
             */
            currentFaction(){
                return this.shared.data.factions[ this.currentFactionName ];
            },


            /**
             * Returns the current faction's scored plans
             * @returns {object[]}
             */
            currentScoredPlans(){
                return this.data.results[this.index].plans.filter( plan => plan.selected );
            },


            /**
             * Returns our prompt data
             * @returns {object}
             */
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

