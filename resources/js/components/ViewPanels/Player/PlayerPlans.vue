<template>
    <div>
        <div class="view-player__title">Completed Plans:</div>

        <div v-if="completedPlans" class="view-player__completed-plans py-4">

            <!-- plans per turn block -->
            <div v-for="(plans, turn) in completedPlans" class="completed-plan__block">

                <!-- turn header -->
                <div class="prompt-question center-text">TURN {{ turn }}</div>

                <!-- turn plans -->
                <div class="d-flex flex-wrap">
                    <div v-for="plan in plans" class="plan-block__container d-flex my-3">

                        <!-- objective pips -->
                        <div class="plan-block__pips">
                            <div v-for="test in plan.objectives" class="plan-block__pip primary-light" :class="{ 'icon-circle' : test.passed, 'icon-circle-open' : !test.passed, 'highlight' : test.scoreable }"></div>
                        </div>

                        <!-- plan image -->
                        <div class='plan-block__image-wrap pos-relative'>
                            <img class="completed-plans__points" :src="`/images/icons/pp-${plan.points}.png`">
                            <img class="plan-block__image" :src="`/images/factions/${faction.name}/plans/${plan.num}.jpg`">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="view-player__empty">No Completed Plans</div>
    </div>
</template>


<script>
    export default {

        name: 'player-plans',
        props: [ 'faction' ],

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            /**
             * Return this player's completed plans
             * @returns {object}
             */
            completedPlans(){
                return _.groupBy( this.faction.plans.completed, 'turnScored' );
            },
        },
    }
</script>


<style>

</style>

