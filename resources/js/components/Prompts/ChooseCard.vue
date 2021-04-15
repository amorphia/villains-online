<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title mb-4">{{ message }}</div>

                <!-- area -->
                <area-flipper :areas="[area]" index="0" classes="">
                    <!-- zoom -->
                    <div class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>

                    <!-- fusion count -->
                    <div v-if="data.fusion" class="toggle area-map__toggle top-0 left-0">Fusion Count {{ shared.faction.fusion }}</div>

                    <!-- card picker-->
                    <card-picker
                        :cards="cards"
                        type="card"
                        @updated="n => index = n"></card-picker>
                </area-flipper>

                <!-- cost -->
                <div v-if="selected.name" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to play this card?` )"></div>

                <!-- resolve buttons -->
                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )">{{ declineMessage }}</button>
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="canSave !== true">{{ saveMessage }}</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-card',

        data() {
            return {
                shared : App.state,
                index : 0,
            };
        },

        watch : {
            cards(){
                this.index = 0;
            }
        },

        methods : {

            /**
             * Resolve this prompt
             * @param option
             */
            resolve( option ) {
                let data = this.getResolveData( option );
                this.shared.respond('choose-card', data);
            },


            /**
             * Return our resolution data
             * @param option
             * @returns {object}
             */
            getResolveData( option ){
                // decline playing a card
                if ( !option ) return { decline : true };

                return {
                    areaName : this.area.name,
                    cardId : this.selected.id,
                    cost : this.cost,
                }
            }
        },

        computed : {

            /**
             * Return decline message
             * @returns {string}
             */
            declineMessage(){
                return this.data.declineMessage ? this.data.declineMessage : 'decline';
            },


            /**
             * Return save message
             * @returns {string}
             */
            saveMessage(){
                return this.data.saveMessage ? this.data.saveMessage : 'choose a card';
            },


            /**
             * Return title message
             * @returns {string}
             */
            message(){
                return this.data.message ? this.data.message : `Play a card in the ${this.area.name}`;
            },


            /**
             * Return our selected card (or an empty object if none selected)
             * @returns {object}
             */
            selected(){
                if( !this.cards.length ) return {};
                return this.cards[this.index];
            },


            /**
             * Return the cards to choose from
             * @returns {Card[]}
             */
            cards(){
                // if the prompt provided the cards use them
                if( this.data.cards && this.data.cards.length ) return this.data.cards;

                // otherwise return the cards in our hand
                return this.shared.faction.cards.hand;
            },


            /**
             * Can we save our choice?
             * @returns {boolean}
             */
            canSave(){
                return this.selected.name &&  this.money >= this.cost;
            },


            /**
             * Return our faction's money
             * @returns {number}
             */
            money(){
                return _.money( this.shared.faction, true );
            },


            /**
             * Returns the cost to choose this card
             * @returns {number}
             */
            cost(){
                let cost = this.data.free ? 0 : this.selected.cost;
                if( cost && this.data.reduceCost ) cost -= this.data.reduceCost;
                if( cost < 0 ) cost = 0;
                return cost;
            },


            /**
             * Returns prompt data
             * @returns {null}
             */
            data(){
                return this.shared.player.prompt.data;
            },


            /**
             * Returns this area object
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[ this.data.area ];
            }

        }

    }
</script>
