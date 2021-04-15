<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-6">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title mb-4">Choose a unit from enemy reinforcements</div>

                <!-- faction options -->
                <div class="mt-3 pb-4">
                    <faction-flipper
                        :factions="enemies"
                        :index="index"
                        classes=""
                        @update="update => index = update">

                        <!-- unit type -->
                        <div v-for="unit in enemyUnits"
                             class="units-hud__unit d-inline-block pos-relative"
                             @click="selectUnit( unit )">
                            <!-- image -->
                            <img
                                class="unit-hud__unit-image"
                                :class="{ripple : unit.selected}"
                                @click="unit.selected = true"
                                :src="`/images/factions/${unit.faction}/units/${unit.type}${unit.flipped ? '-flipped' : ''}.png`">
                        </div>
                    </faction-flipper>
                </div>

                <!-- selected units -->
                <area-flipper :areas="[area]" :index="0" classes="area-header__units">
                    <div class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>
                    <div class="popout-hud__block p-3 pos-relative"
                         v-for="(units, location) in groupBy( selected, 'faction' )">

                        <div v-for="unit in units" class="units-hud__unit d-inline-block pos-relative">
                            <img
                                class="unit-hud__unit-image"
                                @click="unit.selected = false"
                                :src="`/images/factions/${unit.faction}/units/${unit.type}${unit.flipped ? '-flipped' : ''}.png`">
                        </div>
                    </div>
                </area-flipper>

                <!-- buttons -->
                <div class="flex-center">
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="!selected.length">{{ buttonMessage }}</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'high-noon',

        data() {
            return {
                shared : App.state,
                index : 0,
            };
        },

        methods : {

            /**
             * Resolve prompt
             */
            resolve(){
                let data = { units : _.map( this.selected, 'id' ) };
                data = { ...data, ...this.data };
                this.shared.respond( 'high-noon', data );
            },

            /**
             * Select a unit
             * @param unit
             */
            selectUnit( unit ){
                this.enemyUnits.forEach( unit => unit.selected = false );
                this.$set( unit, 'selected', true );
            },


            /**
             * Array group by helper
             *
             * @param array
             * @param prop
             * @returns {Object}
             */
            groupBy( array, prop ){
                return _.groupBy( array, prop );
            },
        },

        computed : {
            /**
             * get message
             * @returns {string}
             */
            buttonMessage(){
                return this.selected.length ? `deploy selected units to the ${this.area.name}` : `select a unit`;
            },


            /**
             * Return enemy factions
             * @returns {[]}
             */
            enemies(){
                let enemies = [];
                this.data.enemies.forEach( enemy => {
                    enemies.push( this.shared.data.factions[enemy] )
                });
                return enemies;
            },


            /**
             * Return enemy unit types
             * @returns {Unit[]}
             */
            enemyUnits(){
                let units = [];
                this.data.types.forEach( type => {
                    let unit = _.find( this.enemy.units, unit => unit.type === type && !unit.location );
                    if( unit ) units.push( unit );
                });
                return units;
            },


            /**
             * Return our currently selected enemy
             * @returns {Faction}
             */
            enemy(){
                return this.shared.data.factions[ this.data.enemies[this.index] ];
            },


            /**
             * Return our selected units
             * @returns {[]}
             */
            selected(){
                if( !this.enemySelected ) return [];

                return [
                    this.ourSelected,
                    this.enemySelected
                ];
            },


            /**
             * Return our selected enemy unit
             * @returns {Unit}
             */
            enemySelected(){
                return _.find( this.enemy.units, unit => unit.selected );
            },


            /**
             * Return our selected unit
             * @returns {Unit}
             */
            ourSelected(){
                if( this.enemySelected ){
                    return _.find( this.shared.faction.units, unit => !unit.location && unit.type === this.enemySelected.type );
                }
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


<style>

</style>

