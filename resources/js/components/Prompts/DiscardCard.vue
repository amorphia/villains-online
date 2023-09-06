<template>
    <player-prompt classes="">
        <div class="d-flex justify-center px-5">
                <div class="width-100 center-text">
                    <!-- title -->
                    <div class="title d-inline-block" v-html="shared.filterText( message )"></div>

                    <!-- cards display -->
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

        <!-- submit button -->
        <div class="width-100 d-flex justify-center">
            <button v-if="data.canDecline" class="button button-empty" @click="decline">Decline</button>
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

            /**
             * Handle a card click
             * @param card
             */
            cardClicked( card ){
                // if we click a card we already selected, unselect it
                if( card.selected ){
                    this.$set( card, 'selected', false );
                    return;
                }

                // if we have more cards to select select this card and return
                if( this.needToSelect !== 0 || this.data.unlimited ){
                    this.$set( card, 'selected', true );
                    return;
                }

                // if we can only select one card, and are already full, unselect all other cards first
                // then select this one
                if( this.data.count <= 1) {
                    this.selected.forEach( item => this.$set( item, 'selected', false ) );
                    this.$set( card, 'selected', true );
                }
            },


            /**
             * Resolve this prompt
             * @param action
             */
            resolve( action ){
                let data = { cards :  _.map( this.selected, 'id' ) };
                data = { ...this.data, ...data };
                this.shared.respond( 'discard-card', data );
            },

            /**
             * Resolve this prompt
             */
            decline(){
                let data = { ...this.data, declined : true };
                this.shared.respond( 'discard-card', data );
            },
        },

        computed : {
            /**
             * return this prompt data
             * @returns {null}
             */
            data(){
                return this.shared.player.prompt.data;
            },


            /**
             * Return our prompt title
             * @returns {string}
             */
            message(){
                if( this.data.message ){
                    return this.data.message;
                }

                if(this.data.unlimited){
                    return 'Discard any number of cards';
                }

                return this.data.count === 1 ? 'Discard a card' : `Discard ${this.data.count} cards`;
            },


            /**
             * Return an array of our selected cards
             * @returns {[]}
             */
            selected(){
                return this.shared.faction.cards.hand.filter( card => card.selected );
            },


            /**
             * Do we need to select any more cards?
             * @returns {number}
             */
            needToSelect(){
                if(this.data.canDecline) return 0;
                return this.data.count - this.selected.length;
            },


            /**
             * Can we submit our choice?
             * @returns {boolean}
             */
            canSubmit(){
                if(this.data.canDecline) return this.selected.length;
                return this.needToSelect === 0;
            },
        }
    }
</script>

