<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title">Choose an action to take with your Lich token</div>

                <div v-if="data.actions.includes('raise')" class="mb-4">
                    <div class="prompt-question center-text">Raiseable Unit Types</div>
                    <div class="flex flex-center">
                        <div v-for="type in data.unitTypes"
                             class="units-hud__unit d-inline-block pos-relative overflow-hidden"
                        >
                            <!-- image -->
                            <img
                                class="unit-hud__unit-image z-1 pos-relative"
                                :src="`/images/factions/skeletons/units/${type}-flipped.png`">
                        </div>
                    </div>
                </div>

                <!-- response buttons -->
                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( 'decline' )">decline</button>
                    <button v-if="data.actions.includes('card')" class="button" @click="resolve( 'card' )">Play a card</button>
                    <button v-if="data.actions.includes('raise')" class="button" @click="resolve( 'raise'  )">Raise a unit</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-lich-option',

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
                let data = { action : choice };
                data = { ...this.data, ...data };
                this.shared.respond( 'choose-lich-option', data );
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

