<template>
    <player-prompt classes="">
            <div class="d-flex justify-center px-5">

                <!-- confirm choices -->
                <div v-if="mode === 'confirm'" class="d-flex align-center justify-center">

                    <!-- confirm plan -->
                    <div class="p-4" v-if="mustChoosePlan">
                        <div class="title">Discard this plan</div>
                        <div class='plan-block__image-wrap'>
                            <img class="plan-block__image" :src="`/images/factions/${shared.faction.name}/plans/${plan.num}.jpg`">
                        </div>
                    </div>

                    <!-- confirm target -->
                    <div class="p-4">
                        <div class="title">Choose this target</div>
                        <div class='plan-block__image-wrap'>
                            <img class="plan-block__image" :src="`/images/cards/${target.file}.jpg`">
                        </div>
                    </div>
                </div>

                <!-- choose target and plan -->
                <div v-else class="width-100 center-text">

                    <!-- title -->
                    <div class="title d-inline-block">{{ message }}</div>

                    <div v-if="instructions" class="prompt-question center-text" v-html="instructions"></div>

                    <!-- card wrap -->
                    <div>
                    <horizontal-scroll classes="choose-target__wrap d-flex pb-3 width-100 plan-block" buttons="true">

                        <!-- plan mode -->
                        <div v-if="mode === 'plans'" class="d-flex pb-3 width-100"
                             v-for="object in shared.faction.plans.current">

                            <div class='plan-block__image-wrap' @click="itemClicked( 'plan', object )"
                                 :class="{ selected : plan && plan.id === object.id }">
                                <img class="plan-block__image" :src="`/images/factions/${shared.faction.name}/plans/${object.num}.jpg`">
                            </div>
                        </div>
                        <!-- plan mode -->

                        <!-- card mode -->
                        <div v-if="mode === 'cards'" class="d-flex pb-3 width-100"
                             v-for="object in shared.faction.cards.hand">

                            <div class='plan-block__image-wrap'
                                 @click="itemClicked( 'target', object )"
                                 :class="{ selected : target && target.id === object.id }">
                                <img class="plan-block__image" :src="`/images/cards/${object.file}.jpg`">
                            </div>
                        </div>

                    </horizontal-scroll>
                    </div>
                </div>

            </div>

            <!-- buttons -->
            <div class="width-100 d-flex justify-center mt-4">
                <button v-if="mode === 'cards' && canMulligan"
                        class="button"
                        @click="mulligan">MULLIGAN CARDS</button>

                <button v-if="mode === 'cards'"
                        class="button button-empty"
                        @click="mode = 'plans'">VIEW PLANS</button>

                <button v-if="mode === 'plans'"
                        class="button"
                        @click="mode = 'cards'">VIEW TARGETS</button>

                <button v-if="mode === 'confirm'"
                        class="button button-empty"
                        @click="mode = 'cards'">BACK</button>

                <button :disabled="!canConfirm" class="button" @click="saveChoices">{{ confirmMessage }}</button>
            </div>
    </player-prompt>

</template>


<script>
    export default {

        name: 'choose-target',
        data() {
            return {
                shared : App.state,
                plan : null,
                target : null,
                mode : 'plans'
            };
        },

        mounted(){
            // handle randomly selected targets
            let randomCard = this.shared.faction.cards.hand.find( card => card.randomTarget );
            if( randomCard ){
                this.target = randomCard;
            }
        },

        methods : {

            /**
             * Save our choices if in confirm mode, otherwise switch to confirm mode
             * @returns {string}
             */
            saveChoices(){
                if( this.mode !== 'confirm' ) return this.mode = 'confirm';

                App.event.emit( 'sound', 'ui' );
                this.shared.socketEmit( 'chooseTargetPlan', this.plan, this.target );
            },

            mulligan(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socketEmit( 'mulliganCards', {
                    faction: this.shared.faction.name,
                });
            },

            /**
             * Handle clicking a card
             *
             * @param type
             * @param object
             */
            itemClicked( type, object ){

                // abort if this wasn't a valid card to click
                if( (this.shared.faction.randomTarget && type === 'target')
                    || (!this.mustChoosePlan && type === 'plan')
                ) return App.event.emit( 'sound', 'error' );


                // clicking the selected object unselects it
                if( this[type] && this[type].id === object.id ) return this[type] = null;


                // if this card doesn't have a target, do nothing
                if( type === 'target' && !object.target ){
                    return App.event.emit( 'sound', 'error' );
                }

                // otherwise set the object as the type
                this[type] = object;
            }
        },

        computed : {

            canMulligan(){
                return !this.shared.faction.cards.hand.some( card => this.shared.data.areas[card.target] );
            },

            /**
             * Get our save button text
             * @returns {string}
             */
            confirmMessage(){
                if( this.mode === 'confirm' ) return "FINALIZE CHOICES";
                return "CONFIRM CHOICES";
            },


            instructions(){
                switch( this.mode ) {
                    case 'plans' : return this.shared.filterText("Completing plan objectives will earn you xPPx");
                    case 'cards' : return  this.shared.filterText("Controlling the area shown at the top of the selected card will be worth xAP1x");
                    case 'confirm' : return null;
                }
            },

            /**
             * Do we need to choose a plan?
             * @returns {boolean}
             */
            mustChoosePlan(){
                return this.shared.faction.plans.current.length >= 3;
            },


            /**
             * Get our title message
             * @returns {string}
             */
            message(){
                switch( this.mode ) {
                    case 'plans' : return this.mustChoosePlan ? "Choose a plan to discard" : "You don't need to discard a plan";
                    case 'cards' : return "Choose your target";
                    case 'confirm' : return "Confirm Choices";
                }
            },


            /**
             * Can we confirm our choices?
             * @returns {boolean}
             */
            canConfirm(){
                return ( this.plan || !this.mustChoosePlan ) && this.target;
            }
        }
    }
</script>


<style>

    .choose-target__wrap {
        max-width: 100%;
    }

    .choose-target__wrap .cards-hud__card {
        width: 16vw;
        height: 23vw;
    }
</style>

