<template>
    <player-prompt classes="">
            <div class="d-flex justify-center px-5">
                <div class="choose-target__plans p-3">
                    <card-picker
                        :cards="shared.faction.plans.current"
                        type="plan"
                        :faction="shared.faction.name"
                        title="Choose a plan to discard"
                        @updated=" selected => plan = selected"></card-picker>
                </div>

                <div class="choose-target__plans p-3">
                    <card-picker
                        :cards="shared.faction.cards.hand"
                        type="card"
                        title="Choose your Target"
                        @updated=" selected => target = selected"></card-picker>
                </div>
            </div>
            <div class="width-100 d-flex justify-center">
                <button class="button" @click="saveChoices" :disabled="!shared.faction.cards.hand[target].target">CONFIRM CHOICES</button>
            </div>
    </player-prompt>

</template>


<script>
    export default {

        name: 'choose-target',
        data() {
            return {
                shared : App.state,
                plan : 0,
                target : 0,
            };
        },

        methods : {
            saveChoices(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socketEmit( 'chooseTargetPlan', this.plan, this.target );
            }
        }
    }
</script>


<style>
    .choose-target {
    }
</style>

