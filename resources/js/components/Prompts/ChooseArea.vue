<template>
    <player-prompt classes="">
        <div class="min-prompt-width px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title" v-html="shared.filterText( message )"></div>

                <!-- area -->
                <area-flipper :areas="areas" :index="index" @update="updateArea">
                    <!-- units -->
                    <div v-if="data.show === 'units'" class="">
                        <unit-row v-for="(set, name) in units"
                                  :units="set"
                                  :key="name"
                                    ></unit-row>
                    </div>
                    <!-- tokens -->
                    <token-row v-else :area="area"></token-row>
                </area-flipper>

                <!-- submit button -->
                <div>
                    <button class="button" @click="resolve">{{ buttonMessage }}</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-area',
        data() {
            return {
                shared : App.state,
                index : 0,
            };
        },

        updated(){
            // select area when updated
            if( this.data.prompt.name === 'choose-area' ){
                this.shared.event.emit('areaSelected', this.area );
            }
        },

        computed : {

            /**
             * Return our button message
             * @returns {string}
             */
            buttonMessage(){
                return `choose the ${this.area.name}`
            },


            /**
             * Return a tally of area units grouped by faction
             * @returns {Unit[]}
             */
            units(){
                let units = {};

                Object.values( this.shared.data.factions ).forEach( faction => {
                    // if enemy only abort if this faction is us
                    if( this.data.enemyOnly && faction.name === this.shared.faction.name ) return;

                    // if player only abort if this faction isn't us
                    if( this.data.playerOnly && faction.name !== this.shared.faction.name ) return;

                    // get the faction's units in the area and add them to out tally
                    let factionUnits = _.factionUnitsInArea( faction, this.area.name );
                    if( factionUnits.length ){
                        units[faction.name] = factionUnits;
                    }
                });

                return units;
            },


            /**
             * Get our title message
             * @returns {string}
             */
            message(){
                return this.data.message ? this.data.message : 'Choose an area'
            },


            /**
             * Returns our current area object
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[ this.currentAreaName ];
            },


            /**
             * Returns our current are name
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
             * Returns our prompt data
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
                let data = { area : this.area.name, ...this.data };
                this.shared.respond( 'choose-area', data );
            },


            /**
             * Update this area index
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

