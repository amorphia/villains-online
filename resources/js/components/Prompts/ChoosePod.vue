<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title">{{ message }}</div>
                <area-flipper :areas="[area]" index="0">
                    <token-set :tokens="[data.token]"
                               classes="center-text"
                               noBorder="true"></token-set>
                </area-flipper>

                <div class="">
                    <button class="button button-empty" @click="resolve( false )">decline</button>
                    <button class="button" @click="resolve( true )">{{ buttonMessage }}</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-pod',
        data() {
            return {
                shared : App.state,
            };
        },


        computed : {
            buttonMessage(){
                return `Take ${this.data.token.type} action`;
            },

            message(){
                return `Take a ${this.data.token.type} action in the ${this.area.name}?`;
            },

            area(){
                return this.shared.data.areas[ this.data.area ];
            },

            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            resolve( activate ){
                let data = {};
                if( !activate ) data.decline = true;
                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'choose-pod', data );
            },
        }
    }
</script>


<style>

    .place-token{
        min-width: 40rem;
    }


</style>

