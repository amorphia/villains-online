<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-2">
            <div class="width-100 d-flex justify-center flex-column align-center">


                <div class="title mb-4">Sacrifice {{ data.count }} units</div>
                <div class="mt-3 pb-4">
                    <area-flipper
                        :areas="areas"
                        :index="areaIndex"
                        classes="area-header__units pt-0"
                        @update="update => areaIndex = update">
                            <unit-row :units="currentAreaUnits" @unit="addUnitFromPlay"></unit-row>
                    </area-flipper>

                </div>
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

                <div v-if="needToSacrifice > 0" class="prompt-question">Choose {{ needToSacrifice }} units to sacrifice</div>

                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )"
                            v-if="data.optional">decline</button>
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="canSave !== true">save</button>
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

            addUnitFromPlay( unit ){

                if( unit.selected ){
                    this.$set( unit, 'selected', false );
                }

                if( this.data.count > 1 && !this.needToSacrifice ) return;

                if( this.data.count > 1 ){
                    this.$set( unit, 'selected', true );
                } else {
                    this.currentAreaUnits.forEach( item => this.$set( item, 'selected', item.id === unit.id ) );
                }
            },

            groupBy( array, prop ){
                return _.groupBy( array, prop );
            },

            areaUnits( area ){
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, area ) );
            },
        },

        computed : {

            needToSacrifice(){
                return this.data.count - this.selected.length;
            },

            canSave(){
                return this.needToSacrifice === 0;
            },

            areas(){
                let areas = [];
                this.data.areas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },


            currentArea(){
                return this.data.areas[this.areaIndex];
            },

            currentAreaUnits(){
                return this.areaUnits( this.currentArea );
            },

            selected(){
                return this.shared.faction.units.filter( unit => unit.selected );
            },


            data(){
                return this.shared.player.prompt.data;
            },

            area(){
                return this.shared.data.areas[ this.currentArea ];
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

