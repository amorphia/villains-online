<template>
    <player-prompt classes="">
        <div class="d-flex justify-center px-5">
                <div class="width-100 center-text">
                    <div class="title d-inline-block">{{ message }}</div>
                    <div>
                        <horizontal-scroll classes="choose-target__wrap d-flex pb-3 width-100 plan-block" buttons="true">

                            <!-- plan mode -->
                            <div class="d-flex pb-3 width-100 justify-center"
                                 v-for="card in shared.faction.cards.hand">
                                <div class='plan-block__image-wrap'
                                     @click="cardClicked( card )"
                                     :class="{ selected : card.selected }">
                                    <img class="plan-block__image" :src="`/images/cards/${card.file}.jpg`">
                                </div>
                            </div>

                            <!-- card mode -->

                        </horizontal-scroll>
                    </div>
                </div>

            </div>
        <div class="width-100 d-flex justify-center">
            <button class="button" :disabled="!canSubmit" @click="resolve">Discard selected cards</button>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'discard-card',

        data() {
            return {
                shared : App.state,
            };
        },

        methods : {

            cardClicked( card ){
                if( card.selected ){
                    this.$set( card, 'selected', false );
                } else {
                    if( this.needToSelect === 0 ) {
                        if( this.data.count > 1) {
                            return;
                        }
                        this.selected.forEach( item => this.$set( item, 'selected', false ) );
                    }
                    this.$set( card, 'selected', true );
                }
            },

            resolve( action ){
                let data = {};
                data.cards = _.map( this.selected, 'id' );
                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'discard-card', data );
            },

        },

        computed : {
            data(){
                return this.shared.player.prompt.data;
            },

            message(){
                return this.data.count === 1 ? 'Discard a card' : `Discard ${this.data.count} cards`;
            },

            selected(){
                return this.shared.faction.cards.hand.filter( card => card.selected );
            },

            needToSelect(){
                return this.data.count - this.selected.length;
            },

            canSubmit(){
                return this.needToSelect === 0;
            },
        }
    }
</script>


<style>

</style>

