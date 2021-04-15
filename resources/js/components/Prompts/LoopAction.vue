<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title">Choose a token from your reserves to replace your Loop token</div>

                <!-- area tokens -->
                <area-flipper :areas="[area]" :index="0">
                    <token-row :area="area" :highlight="data.token"></token-row>
                </area-flipper>

                <!-- replacement tokens -->
                <div class="p-4">
                    <token-set :tokens="tokens" @tokenClicked="selectToken" title="Reserves" :selected="token"></token-set>
                </div>

                <!-- buttons -->
                <div class="flex-center">
                    <button class="button"
                            @click="resolve"
                            :disabled="!canSave">Swap selected token</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'loop-action',

        data() {
            return {
                shared : App.state,
                token : null
            };
        },

        methods : {
            /**
             * Resolve prompt
             */
            resolve(){
                this.shared.respond( 'loop-action', { token : this.token } );
            },

            /**
             * Select a replacement token
             * @param token
             */
            selectToken( token ){
                // if we click a selected token, unselected it
                if( this.token?.id === token.id ){
                    this.token = null;
                    return;
                }

                // otherwise select it
                this.token = token;
            }
        },

        computed : {

            /**
             * Returns our valid token replacement types
             * @returns {Token[]}
             */
            tokens(){
                let tokens = [];
                let types = [];
                this.shared.faction.tokens.forEach( token => {
                    if( !token.location && !types.includes( token.type ) ){
                        types.push( token.type );
                        tokens.push( token );
                    }
                });
                return tokens;
            },


            /**
             * Can we save this choice
             * @returns {boolean}
             */
            canSave(){
                return !! this.token;
            },

            /**
             * Return prompt data
             * @returns {null}
             */
            data(){
              return this.shared.player.prompt.data;
            },


            /**
             * Return our area object
             * @returns {Area}
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

