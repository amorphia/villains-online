<template>
    <player-prompt classes="">
        <div class="min-prompt-width px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <!-- title -->
                <div class="title">{{ message }}</div>

                <!-- area -->
                <area-flipper :areas="areas" :index="index" @update="updateArea">
                    <div class="width-100 choose-action__skill-ability center-text" v-html="this.shared.filterText( this.area.skill )"></div>
                </area-flipper>

                <!-- submit button -->
                <div class="">
                    <button class="button" @click="resolve">{{ buttonMessage }}</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-skill',
        data() {
            return {
                shared : App.state,
                index : 0,
            };
        },

        computed : {

            /**
             * Get button message
             * @returns {string}
             */
            buttonMessage(){
                return `Activate the ${this.area.name} skill`
            },

            /**
             * Get title message
             * @returns {string}
             */
            message(){
                return this.data.message ? this.data.message : 'Choose a skill to activate'
            },


            /**
             * Get current area object
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[ this.currentAreaName ];
            },


            /**
             * Get current are name
             * @returns {string}
             */
            currentAreaName(){
                return this.data.areas[this.index];
            },


            /**
             * Return an array of our area objects
             * @returns {Area[]}
             */
            areas(){
                return this.data.areas.map( areaName => this.shared.data.areas[areaName] );
            },


            /**
             * Return our prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },
        },


        methods : {
            /**
             * Resolve this prompt
             */
            resolve(){
                let data = { area : this.area.name };
                data = { ...data, ...this.data };
                this.shared.respond( 'choose-skill', data );
            },


            /**
             * Update selected area
             * @param index
             */
            updateArea( index ){
                if( index === this.index ) return;
                this.area.tokens.forEach( token => this.$set( token, 'selected', false ) );
                this.index = index;
            },
        }
    }
</script>


