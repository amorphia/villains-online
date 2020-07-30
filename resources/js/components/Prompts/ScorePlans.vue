<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title mb-4">{{ message }}</div>

                <horizontal-scroll classes="plans-wrap d-flex pb-3 width-100">
                    <plan-block v-if="mode === 'plans'" v-for="plan in data.plans"
                                :faction="shared.faction"
                                :plan="plan"
                                :key="plan.plan.id"
                                @clicked="toggle( plan )"></plan-block>

                    <card-block v-if="mode === 'discard'" v-for="card in shared.faction.cards.hand"
                                :card="card"
                                :key="card.id"
                                @clicked="toggleCard"></card-block>
                </horizontal-scroll>

                <div v-if="cardsToDiscard > 0" class="prompt-question mt-3">Discard {{ cardsToDiscard }} action cards to score these plans?</div>

                <div class="flex-center">
                    <button v-if="mode !== 'plans'" class="button" @click="mode = 'plans'">back</button>
                    <button class="button" :disabled="!canSave" @click="resolve">confirm scored plans</button>
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

            toggleCard( card ){
                this.$set( card, 'selected', !card.selected );
            },

            resolve() {
                if( this.cardsToDiscard && this.mode === 'plans' ){
                    this.mode = 'discard';
                } else {
                    let data = {
                        faction : this.shared.faction.name,
                        plans : this.data.plans
                    };

                    if( this.cardsToDiscard ){
                        data.discard = [];
                        this.shared.faction.cards.hand.forEach( card => {
                            if( card.selected ) data.discard.push( card.id );
                        })
                    }

                    this.shared.respond('score-plans', data );
                }
            },

        },

        computed : {

            canSave(){
                switch( this.mode ){
                    case 'plans':
                        return this.canDiscard;
                    case 'discard':
                        return this.selectedCards.length === this.cardsToDiscard;
                }
            },

            selectedCards(){
                return this.shared.faction.cards.hand.filter( card => card.selected );
            },

            message(){
                return this.mode === 'plans' ? "Score Plans" : "Choose cards to discard";
            },

            canDiscard(){
                return this.shared.faction.cards.hand.length >= this.cardsToDiscard;
            },

            selectedPlans(){
                return this.data.plans.filter( plan => plan.selected );
            },

            cardsToDiscard(){
                return this.selectedPlans.reduce( (acc, plan) => {
                    for( let objective of plan.objectives ){
                        for( let test of objective.tests ) {
                            if (test.result && test.discardCards) acc += test.discardCards;
                        }
                    }
                    return acc;
                }, 0 );
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

