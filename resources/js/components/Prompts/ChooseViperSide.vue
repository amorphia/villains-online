<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title">Which side to set Red Viper?</div>

                <div class="flex-center">
                    <unit-icon :unit="war" @unit="setChoice" />
                    <unit-icon :unit="peace" @unit="setChoice" />
                </div>

                <button class="button" :disabled="!choice" @click="resolve( )">Save</button>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-viper-side',
        data() {
            return {
                shared : App.state,
                choice: null,
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

            war(){
                return {
                    faction: 'guerrillas',
                    type: 'champion',
                    id: 'war',
                    selected: this.choice === 'war'
                }

            },

            peace(){
                return {
                    faction: 'guerrillas',
                    type: 'champion',
                    id: 'peace',
                    flipped: true,
                    selected: this.choice === 'peace'
                }
            }
        },

        methods : {
            setChoice( unit ){
                console.log( 'setChoice', unit );
                this.choice = unit.id;
            },

            /**
             * Resolve prompt
             */
            resolve(){
                let data = { side : this.choice };
                data = { ...this.data, ...data };
                this.shared.respond( 'choose-viper-side', data );
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

