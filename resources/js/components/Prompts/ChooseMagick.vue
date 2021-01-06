<template>
    <player-prompt classes="">
        <div class="d-flex justify-center px-5">
                <div class="width-100 center-text">
                    <div class="title d-inline-block">Choose a rule card to play in the {{ data.area }} {{ data.free ? 'for free' : ''}}</div>
                    <div>
                        <horizontal-scroll classes="choose-target__wrap d-flex pb-3 width-100 plan-block" buttons="true">

                            <!-- plan mode -->
                            <div class="d-flex pb-3 width-100 justify-center"
                                 v-for="card in data.cards">

                                <div class='plan-block__image-wrap'
                                     @click="cardClicked( card )"
                                     :class="{ selected : card.selected, 'opacity-5' : card.type !== 'rule' }">
                                    <img class="plan-block__image" :src="`/images/cards/${card.file}.jpg`">
                                </div>
                            </div>

                            <!-- card mode -->

                        </horizontal-scroll>
                    </div>
                </div>

            </div>

        <div v-if="this.cost" class="prompt-question center-text" v-html="shared.filterText( `Pay xC${cost}x to play this card?` )"></div>


        <div class="width-100 d-flex justify-center">
            <button class="button button-empty" @click="resolve( false )">decline</button>
            <button class="button" :disabled="!this.selected.length" @click="resolve( true )">Submit</button>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-magick',

        data() {
            return {
                shared : App.state,
            };
        },

        mounted(){
            if( this.selectableCards.length === 1 ){
                this.$set( this.selectableCards[0], 'selected', true );
            }
        },

        methods : {

            cardClicked( card ){
                if( card.selected ){
                    this.$set( card, 'selected', false );
                } else {
                    if( this.selected.length || !this.canSelectCard( card ) ) return;
                    this.$set( card, 'selected', true );
                }
            },

            resolve( action ){
                let data = {};

                if( action ){
                    data.selected = this.selected[0].id;
                    data.unselected = this.data.cards.filter( card => !card.selected ).map( card => card.id );
                } else {
                    data.unselected = this.data.cards.map( card => card.id );
                }

                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'choose-magick', data );
            },

            canSelectCard( card ){
                return card.type === 'rule'
                        && ( this.data.free || _.money( this.shared.faction ) >= card.cost );
            }
        },

        computed : {
            data(){
                return this.shared.player.prompt.data;
            },

            selectableCards(){
                return this.data.cards.filter( card => this.canSelectCard( card ) );
            },

            cost(){
                if( this.data.free ) return 0;

                return this.selected.length ? this.selected[0].cost : 0;
            },

            selected(){
                return this.data.cards.filter( card => card.selected );
            },
        }
    }
</script>


<style>

</style>

