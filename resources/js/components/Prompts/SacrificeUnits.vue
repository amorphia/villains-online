<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title mb-4">Sacrifice {{ data.count }} units</div>

                <!-- areas -->
                <div class="mt-3 pb-4">
                    <area-flipper
                        :areas="areas"
                        :index="areaIndex"
                        classes="area-header__units pt-0"
                        @update="update => areaIndex = update">
                            <unit-row :units="currentAreaUnits" @unit="addUnitFromPlay"></unit-row>
                    </area-flipper>

                </div>

                <!-- selected units -->
                <div class="sacrifice-units__container p-4">
                    <div class="popout-hud__block p-3 pos-relative"
                         v-for="(units, location) in groupBy( selected, 'location' )"
                         :data-count="location">
                        <div v-for="unit in units" class="units-hud__unit d-inline-block pos-relative">
                            <img
                                class="unit-hud__unit-image"
                                @click="unit.selected = false"
                                :src="`/images/factions/${unit.faction}/units/${unit.type}${unit.flipped ? '-flipped' : ''}.png`">
                        </div>
                    </div>
                </div>

                <!-- need to sacrifice text -->
                <div v-if="needToSacrifice > 0" class="prompt-question">Choose {{ needToSacrifice }} units to sacrifice</div>

                <!-- buttons -->
                <div class="flex-center">
                    <!-- decline -->
                    <button class="button button-empty" @click="resolve( false )"
                            v-if="data.optional">decline</button>

                    <!-- submit -->
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="canSave !== true">{{ buttonMessage }}</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'sacrifice-units',
        data() {
            return {
                shared : App.state,
                areaIndex : 0
            };
        },

        methods : {

            /**
             * Resolve prompt
             *
             * @param option
             */
            resolve( option ){
                let data = {
                    units : []
                };

                if( option ){
                    data.units = _.map( this.selected, 'id' );
                }

                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'sacrifice-units', data );
            },


            /**
             * Add a unit from play to our selected sacrifices
             * @param unit
             */
            addUnitFromPlay( unit ){

                // if already selected, toggle to unselected
                if( unit.selected ){
                    this.$set( unit, 'selected', false );
                }

                // if we already have enough units, do nothing
                if( this.data.count > 1 && !this.needToSacrifice ) return;

                // if we need more than one unit just select our unit
                if( this.data.count > 1 ){
                    this.$set( unit, 'selected', true );
                    return;
                }

                // if we only need to select one unit total, then unselect all other units when selecting this one
                this.currentAreaUnits.forEach( item => this.$set( item, 'selected', item.id === unit.id ) );
            },


            /**
             * Group array by property helper
             *
             * @param array
             * @param prop
             * @returns {Object}
             */
            groupBy( array, prop ){
                return _.groupBy( array, prop );
            },


            /**
             * Returns this faction's units in the given area
             *
             * @param area
             * @returns {*}
             */
            areaUnits( area ){
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, area, { basic : this.data.basicOnly, type : this.data.type } ) );
            },
        },

        computed : {

            /**
             * Get our button message
             * @returns {string}
             */
            buttonMessage(){
                return this.canSave ? 'sacrifice selected units' : `choose ${this.needToSacrifice} more unit${this.needToSacrifice > 1 ? 's':''}`;
            },


            /**
             * How many more units do we need to sacrifice
             * @returns {number}
             */
            needToSacrifice(){
                return this.data.count - this.selected.length;
            },


            /**
             * Can we save our choices?
             *
             * @returns {boolean}
             */
            canSave(){
                return this.needToSacrifice === 0;
            },


            /**
             * Returns the area objects for each of the supplied area names
             *
             * @returns {[]}
             */
            areas(){
                let areas = [];
                this.data.areas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },


            /**
             * Our current area name
             * @returns {string}
             */
            currentAreaName(){
                return this.data.areas[this.areaIndex];
            },


            /**
             * Returns our faction's units in our currently selected area
             *
             * @returns {Unit[]}
             */
            currentAreaUnits(){
                return this.areaUnits( this.currentAreaName );
            },


            /**
             * Return the currently selected units
             *
             * @returns {Unit[]}
             */
            selected(){
                return this.shared.faction.units.filter( unit => unit.selected );
            },


            /**
             * returns prompt data
             *
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },


            /**
             * Returns the current area object
             * @returns {*}
             */
            area(){
                return this.shared.data.areas[ this.currentAreaName ];
            },
        }
    }
</script>


<style>
    .sacrifice-units__container {
        background-color: rgba(0,0,0,.6);
    }
    .sacrifice-units__container:empty {
        display: none;
    }
</style>

