<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title mb-4">Score Plans</div>

                <horizontal-scroll classes="plans-wrap d-flex pb-3 width-100">
                    <plan-block v-if="mode === 'plans'" v-for="plan in data.plans"
                                :faction="shared.faction"
                                :plan="plan"
                                :key="plan.plan.id"
                                @clicked="toggle( plan )"></plan-block>
                </horizontal-scroll>


                <div class="flex-center">
                    <button class="button" @click="resolve">confirm scored plans</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>

    export default {

        name: 'score-plans',
        data() {
            return {
                shared : App.state,
                index : 0,
                mode : 'plans',
            };
        },
        methods : {

            toggle( plan ){
                if( plan.points === 0 ) return;
                plan.selected = !plan.selected;
            },

            resolve() {
                let data = {
                    faction : this.shared.faction.name,
                    plans : this.data.plans
                };

                this.shared.respond('score-plans', data );
            },

        },

        computed : {

            selectedPlans(){
                return this.data.plans.filter( plan => plan.selected );
            },

            data(){
                return this.shared.player.prompt.data;
            },

        }

    }
</script>


<style>
    .plans-wrap {
        max-width: 100%;
    }

</style>

