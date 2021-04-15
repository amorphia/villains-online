<template>
    <player-prompt>
        <div class="min-prompt-width px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <!-- title -->
                <div class="title">{{ message }}</div>

                <!-- area / token -->
                <area-flipper :areas="[area]" index="0">
                    <token-set :tokens="tokens"
                               classes="center-text"
                               noBorder="true"
                               :selected="this.wildType"></token-set>
                </area-flipper>

                <!-- move cost -->
                <div v-if="cost" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to activate as a move?` )"></div>

                <!-- submit button -->
                <div>
                    <button class="button" :disabled="disabled" @click="resolve">{{ buttonMessage }}</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-wild',
        data() {
            return {
                shared : App.state,
                tokens : [
                    { name : 'deploy', id : 1 },
                    { name : 'card', id : 2 },
                    { name : 'battle', id : 3 },
                    { name : 'move', id : 4 },
                ],
                type : null
            };
        },

        mounted(){
            this.shared.event.on( 'tokenClicked', this.selectToken );
        },

        computed : {
            /**
             * Get our button message
             * @returns {string}
             */
            buttonMessage(){
                return this.type ? `activate as a ${this.type.name} token` : 'Choose Basic Token'
            },


            /**
             * Is submitting disabled?
             * @returns {boolean}
             */
            disabled(){
               return !this.type || (this.shared.faction.resources + this.shared.faction.energy ) < this.cost;
            },


            /**
             * What is our token cost?
             * @returns {number}
             */
            cost(){
               return this.type && this.type.name === 'move' ? 2 : 0;
            },


            /**
             * get our title message
             * @returns {string}
             */
            message(){
                return this.data.message ? this.data.message : 'Choose how to activate your wild token'
            },


            /**
             * Return our token area object
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[ this.data.area ];
            },


            /**
             * Return our prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            /**
             * Select a token
             * @param token
             */
            selectToken( token ){
                this.type = token;
            },


            /**
             * Resolve this prompt
             */
            resolve(){
                let data = { type : this.type.name, ...this.data };
                this.shared.respond( 'choose-wild', data );
            },
        }
    }
</script>

