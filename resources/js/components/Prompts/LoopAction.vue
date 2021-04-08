<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title">Choose a token from your reserves to replace your Loop token</div>
                <area-flipper :areas="[area]" :index="0">
                    <token-row :area="area" :highlight="data.token"></token-row>
                </area-flipper>

                <div class="p-4">
                    <token-set :tokens="tokens" @tokenClicked="selectToken" title="Reserves" :selected="token"></token-set>
                </div>


                <div class="flex-center">
                    <button class="button"
                            @click="resolve"
                            :disabled="!canActivate">Swap selected token</button>
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
            resolve(){
                this.shared.respond( 'loop-action', { token : this.token } );
            },

            selectToken( token ){
                if( this.token && this.token.id === token.id ) this.token = null;
                else this.token = token;
            }
        },

        computed : {

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

            canActivate(){
                return !! this.token;
            },

            data(){
              return this.shared.player.prompt.data;
            },

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

