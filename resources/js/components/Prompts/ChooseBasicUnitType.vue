<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-6">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title mb-4">Choose a basic unit type</div>

                <!-- faction options -->
                <div class="mt-3 pb-4">

                        <!-- unit type -->
                        <div v-for="unit in units"
                             class="units-hud__unit d-inline-block pos-relative overflow-hidden"
                             :class="{selected : unit.type === type}"
                             @click="selectUnit( unit )">
                            <!-- image -->
                            <img
                                class="unit-hud__unit-image z-1 pos-relative"
                                :src="`/images/units/${unit.type}.png`">
                        </div>
                </div>

                <!-- buttons -->
                <div class="flex-center">
                    <button class="button" @click="resolve" :disabled="!type">{{ buttonMessage }}</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-basic-unit-type',

        data() {
            return {
                shared : App.state,
                units : [
                    { 'type' : 'goon' },
                    { 'type' : 'mole' },
                    { 'type' : 'talent' },
                    { 'type' : 'patsy' },
                ],
                type : null,
            };
        },

        methods : {

            /**
             * Resolve prompt
             */
            resolve(){
                let data = { type : this.type };
                data = { ...this.data, ...data };
                this.shared.respond( 'choose-basic-unit-type', data );
            },

            /**
             * Select a unit
             * @param unit
             */
            selectUnit( unit ){
                if( unit.type === this.type ){
                    return this.type = null;
                }

                this.type = unit.type;
            },

        },

        computed : {
            /**
             * get message
             * @returns {string}
             */
            buttonMessage(){
                return this.type ? `submit selection` : `select a unit`;
            },

            /**
             * Return prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },


            /**
             * Return destination area
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[this.data.area];
            },

        }
    }
</script>


