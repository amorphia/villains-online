<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title">{{ data.message }}</div>

                <!-- area flipper / unit selection -->
                <area-flipper v-if="data.showUnits" :areas="[shared.data.areas[data.showUnits]]" :index="0">
                    <div class="">
                        <unit-row v-for="(set, name) in areaUnits"
                                  :units="set"
                                  :key="name"
                        ></unit-row>
                    </div>
                </area-flipper>

                <!-- response buttons -->
                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )">{{ noText }}</button>
                    <button class="button" @click="resolve( true )">{{ yesText }}</button>
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
            noText(){
                return this.data.noButtonText ?? "no";
            },

            yesText(){
                return this.data.yesButtonText ?? "yes";
            },

            /**
             * return prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },

            area(){
                // this.shared.data.areas is the core game data store
                // this.currentArea is the name of the currently selected area
                return this.shared.data.areas[ this.data.showUnits ];
            },

            areaUnits(){
                // if we don't have the "showEnemyUnits" flag set in our options, then return an empty array
                if( !this.data.showUnits ) return [];

                // return the enemy units in the current area that meet our option flag
                return _.allUnitsInArea(
                    this.area,
                    this.shared.data.factions,
                    {
                        basic : this.data.basicOnly,
                        notHidden : this.data.notHidden,
                    }
                );
            },
        },

        methods : {
            /**
             * Resolve prompt
             * @param choice
             */
            resolve( choice ){
                let data = { answer : choice };
                data = { ...this.data, ...data };
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

