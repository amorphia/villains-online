<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title">{{ message }}</div>
                <area-flipper :areas="[area]" index="0">
                    <token-set :tokens="tokens"
                               classes="center-text"
                               noBorder="true"
                               :selected="this.type"></token-set>
                </area-flipper>

                <div v-if="cost" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to activate as a move?` )"></div>

                <div class="">
                    <button class="button" :disabled="disabled" @click="resolve">SAVE</button>
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

            disabled(){
               return !this.type || (this.shared.faction.resources + this.shared.faction.energy ) < this.cost;
            },

            cost(){
               return this.type && this.type.name === 'move' ? 2 : 0;
            },

            message(){
                return this.data.message ? this.data.message : 'Choose how to activate your wild token'
            },

            area(){
                return this.shared.data.areas[ this.data.area ];
            },

            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            selectToken( token ){
                this.type = token;
            },

            resolve(){
                let data = {};
                data.type = this.type.name;
                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'choose-wild', data );
            },
        }
    }
</script>


<style>

    .place-token{
        min-width: 40rem;
    }


</style>

