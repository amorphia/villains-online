<template>
    <player-prompt classes="">
        <div class="choose-action px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title">Resolve this skill twice? You have {{ data.markers }} hAx0rEd Markers remaining</div>

                <!-- area skill -->
                <area-flipper :areas="[area]" :index="0">
                    <div class="width-100 choose-action__skill-ability center-text"
                         v-html="this.shared.filterText( this.area.skill )"></div>
                </area-flipper>

                <!-- buttons -->
                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )">Decline</button>
                    <button class="button" @click="resolve( true )">Resolve Twice</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'double-resolve',

        data() {
            return {
                shared : App.state
            };
        },

        methods : {
            /**
             * Resolve prompt
             * @param choice
             */
            resolve( choice ){
                let data = { doubleResolve : choice };
                this.shared.respond('double-resolve', data );
            }
        },

        computed : {
            /**
             * return prompt data
             * @returns {null}
             */
            data(){
                return this.shared.player.prompt.data;
            },

            /**
             * Return current area
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[this.data.area];
            }
        }
    }
</script>
