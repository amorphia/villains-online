<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title">{{ message }}</div>
                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )">No</button>
                    <button class="button" @click="resolve( true )">Yes</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'question',

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            data(){
                return this.shared.player.prompt.data;
            },
            message(){
                return this.data.message;
            },
        },

        methods : {
            resolve( choice ){
                console.log( 'choice', choice );
                let data = {};
                data.answer = choice;
                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'question', data );
            }
        },


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

