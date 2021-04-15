<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title">Would you like to activate or decline this token?</div>

                <!-- area and tokens -->
                <area-flipper :areas="[area]" :index="0">
                    <token-row :area="area" :highlight="data.token"></token-row>
                </area-flipper>

                <!-- select wild type -->
                <div v-if="data.wildType" class="py-4">
                    <div class="prompt-question center-text">This token will be activated as the following:</div>
                    <token-set :tokens="[{ name: data.wildType, id : 1 }]"
                               classes="center-text"
                               noBorder="true"
                    ></token-set>
                </div>

                <!-- cost -->
                <div v-if="data.cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${data.cost}x to activate this token?` )"></div>

                <!-- response buttons -->
                <div class="flex-center">
                    <button class="button button-empty" @click="resolve('decline' )">Decline Token</button>
                    <button class="button"
                            @click="resolve( 'activate' )"
                            :disabled="!canActivate">Activate Token</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'activate-decline',

        data() {
            return {
                shared : App.state
            };
        },

        methods : {
            /**
             * Resolve this prompt
             * @param choice
             */
            resolve( choice ){
                this.shared.respond('activate-decline', choice, this.data.token.id, this.data.wildType );
            }
        },

        computed : {

            /**
             * Can we activate this token?
             * @returns {boolean}
             */
            canActivate(){
                return _.money( this.shared.faction ) >= this.data.cost;
            },


            /**
             * Return our prompt data object
             * @returns {object}
             */
            data(){
              return this.shared.player.prompt.data;
            },


            /**
             * Return our area object, if applicable
             * @returns {Area|null}
             */
            area(){
                if( this.data.token ){
                    return this.shared.data.areas[this.data.token.location];
                }
            }
        }
    }
</script>


<style>
    .prompt-question {
        color: var(--highlight-color);
        font-size: 1.4em;
    }

    .prompt-question.red {
        color: #ff0000;
    }
</style>

