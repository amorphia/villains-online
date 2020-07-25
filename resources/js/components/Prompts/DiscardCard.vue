<template>
    <player-prompt classes="">
        <div class="d-flex justify-center px-5">
            <div class="choose-target__plans p-3">
                <div class="title">Choose a card to discard</div>
                <card-picker
                    :cards="shared.faction.cards.hand"
                    type="card"
                    @updated="selected => index = selected"></card-picker>
            </div>
        </div>
        <div class="width-100 d-flex justify-center">
            <button class="button" @click="saveChoices">Discard selected card</button>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'discard-card',

        data() {
            return {
                shared : App.state,
                index : 0
            };
        },

        methods : {
            saveChoices(){
                this.shared.respond( 'discard-card', { faction : this.shared.faction.name, cardId : this.shared.faction.cards.hand[this.index].id } );
            }
        }
    }
</script>


<style>

</style>

