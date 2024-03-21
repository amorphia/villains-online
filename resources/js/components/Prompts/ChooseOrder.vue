<template>
    <player-prompt classes="">
        <div class="d-flex justify-center px-5">
                <div class="width-100 center-text">

                    <!-- title -->
                    <div class="title d-inline-block">{{ message }}</div>

                    <!-- cards -->
                    <div>
                        <horizontal-scroll classes="choose-target__wrap d-flex pb-3 width-100 plan-block" buttons="true">
                            <div class="d-flex pb-3 width-100 justify-center"
                                 v-for="order in data.orders">
                                <div class='plan-block__image-wrap'
                                     @click="selectedOrder = order"
                                     :class="{ selected : selectedOrder === order }"
                                >
                                    <img class="plan-block__image" :src="`/images/factions/agency/orders/${order}.jpg`">
                                </div>
                            </div>
                        </horizontal-scroll>
                    </div>
                </div>
            </div>

        <!-- buttons -->
        <div class="width-100 d-flex justify-center">
            <button class="button button-empty" @click="resolve( false )">decline</button>
            <button class="button" :disabled="!this.selectedOrder" @click="resolve( true )">Submit</button>
        </div>

    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-order',

        data() {
            return {
                shared : App.state,
                selectedOrder : null,
            };
        },

        mounted(){
            // if we only have one selectable card, select it
            if( this.data.orders.length === 1 ){
                this.selectedOrder = this.data.orders[0];
            }
        },

        methods : {
            /**
             * Resolve this prompt
             * @param action
             */
            resolve( action ){
                let data = this.getResolveData( action );
                data = { ...this.data, ...data };
                this.shared.respond( 'choose-order', data );
            },


            /**
             * Get our resolve data
             *
             * @param action
             * @returns {object}
             */
            getResolveData( action ){
                // if we didn't select anything
                if( !action ) return { decline : true };

                // if we selected a card
                return { selectedOrder : this.selectedOrder };
            },
        },

        computed : {
            message(){
                if( this.data.message ) return this.data.message;

                return `Choose an order to issue to the surveyor`;
            },

            /**
             * Return prompt data
             * @returns {null}
             */
            data(){
                return this.shared.player.prompt.data;
            },
        }
    }
</script>
