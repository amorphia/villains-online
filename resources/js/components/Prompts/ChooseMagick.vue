<template>
    <player-prompt classes="">
        <div class="d-flex justify-center px-5">
                <div class="width-100 center-text">

                    <!-- title -->
                    <div class="title d-inline-block">Choose a rule card to play in the {{ data.area }} {{ data.free ? 'for free' : ''}}</div>

                    <!-- cards -->
                    <div>
                        <horizontal-scroll classes="choose-target__wrap d-flex pb-3 width-100 plan-block" buttons="true">
                            <div class="d-flex pb-3 width-100 justify-center"
                                 v-for="card in data.cards">
                                <div class='plan-block__image-wrap'
                                     @click="cardClicked( card )"
                                     :class="{ selected : card.selected, 'opacity-5' : card.type !== 'rule' }">
                                    <img class="plan-block__image" :src="`/images/cards/${card.file}.jpg`">
                                </div>
                            </div>
                        </horizontal-scroll>
                    </div>
                </div>
            </div>

        <!-- cost -->
        <div v-if="this.cost" class="prompt-question center-text" v-html="shared.filterText( `Pay xC${cost}x to play this card?` )"></div>

        <!-- buttons -->
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
            // if we only have one selectable card, select it
            if( this.selectableCards.length === 1 ){
                this.$set( this.selectableCards[0], 'selected', true );
            }
        },

        methods : {
            cardClicked( card ){
                // unselect a card if we click it when selected
                if( card.selected ){
                    this.$set( card, 'selected', false );
                    return;
                }

                // if we can't select this card, abort
                if( this.selected.length || !this.canSelectCard( card ) ) return;

                // select the card
                this.$set( card, 'selected', true );
            },


            /**
             * Resolve this prompt
             * @param action
             */
            resolve( action ){
                let data = this.getResolveData( action );
                data = { ...data, ...this.data };
                this.shared.respond( 'choose-magick', data );
            },


            /**
             * Get our resolve data
             *
             * @param action
             * @returns {object}
             */
            getResolveData( action ){
                // if we didn't select anything
                if( !action ) return { unselected : this.data.cards.map( card => card.id ) };

                // if we selected a card
                return {
                    selected : this.selected[0].id,
                    unselected : this.data.cards.filter( card => !card.selected ).map( card => card.id )
                }
            },


            /**
             * Can we select the given card?
             *
             * @param card
             * @returns {boolean}
             */
            canSelectCard( card ){
                return card.type === 'rule'
                        && ( this.data.free || _.money( this.shared.faction ) >= card.cost );
            }
        },

        computed : {

            /**
             * Return prompt data
             * @returns {null}
             */
            data(){
                return this.shared.player.prompt.data;
            },


            /**
             * Return an array of selectable cards
             * @returns {Card[]}
             */
            selectableCards(){
                return this.data.cards.filter( card => this.canSelectCard( card ) );
            },


            /**
             * calculate our cost
             * @returns {number}
             */
            cost(){
                if( this.data.free ) return 0;
                return this.selected.length ? this.selected[0].cost : 0;
            },


            /**
             * Return an array of our selected cards
             * @returns {Card[]}
             */
            selected(){
                return this.data.cards.filter( card => card.selected );
            },
        }
    }
</script>
