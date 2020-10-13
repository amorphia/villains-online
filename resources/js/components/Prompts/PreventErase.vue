<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title">Prevent the past from being erased?</div>
                <area-flipper :areas="[area]" :index="0">
                    <token-row :area="area" :highlight="data.token"></token-row>
                </area-flipper>

                <div class="prompt-question" v-html="shared.filterText( `Pay xC1x to prevent this token from being discarded?` )"></div>
                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )">Discard Token</button>
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="!canActivate">Pay to keep token</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'prevent-erase',

        data() {
            return {
                shared : App.state
            };
        },

        methods : {
            resolve( choice ){
                this.shared.respond('prevent-erase', { pay : choice } );
            }
        },

        computed : {

            canActivate(){
                return _.money( this.shared.faction ) >= 1;
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

