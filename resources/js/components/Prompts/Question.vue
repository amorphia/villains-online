<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title">{{ data.message }}</div>

                <!-- response buttons -->
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
            /**
             * return prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },
        },

        methods : {
            /**
             * Resolve prompt
             * @param choice
             */
            resolve( choice ){
                let data = { answer : choice, ...this.data };
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

