<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">


                <div class="title mb-4">{{ data.message }}</div>

                <div class="mt-3 pb-4">
                    <area-flipper
                        :areas="[fromArea]"
                        locked="true"
                        index="0"
                        classes="area-header__units pt-0">
                        <unit-row :units="fromAreaUnits" @unit="addUnitToArea"></unit-row>
                    </area-flipper>
                </div>

                <area-flipper :areas="toAreas"
                              :index="toAreaIndex"
                              classes="area-header__units"
                              @update="updateToIndex">
                    <unit-row :units="currentAreaUnits" @unit="removeUnitFromArea"></unit-row>
                </area-flipper>

                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to move these units?` )"></div>

                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )">decline</button>
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="!canSave">move selected units</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'move-away',
        data() {
            return {
                shared : App.state,
                toAreaIndex : 0
            };
        },

        methods : {
            resolve( option ){
                let data = {};

                if( !option ){
                    data.decline = true;
                } else {
                    data.moves = this.selected.map( unit => {
                        return { units : [unit.id], toArea : unit.selected };
                    });
                    data.cost = this.cost;
                }

                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'move-away', data );
            },

            updateToIndex( index ){
                this.toAreaIndex = index;
                if( this.data.limit === 1 && this.selected.length ) this.moveSelectedToArea();
            },

            moveSelectedToArea(){
                let unit = this.selected[0];
                this.$set( unit, 'selected', this.area.name );
            },

            addUnitToArea( unit ){

                if( this.currentAreaUnits.length
                    || ( this.data.limit && this.selected.length >= this.data.limit ) ) return;

                this.$set( unit, 'selected', this.area.name );
            },

            removeUnitFromArea( unit ){
                this.$set( unit, 'selected', null );
            },

        },

        computed : {

            fromArea(){
                return this.shared.data.areas[ this.data.fromArea ];
            },

            area(){
                return this.shared.data.areas[ this.data.toAreas[this.toAreaIndex] ];
            },

            fromAreaUnits(){
                let units = [];

                if( this.data.enemyOnly ){ // enemy units
                    Object.values( this.shared.data.factions ).forEach( faction => {
                        if( faction.name === this.shared.faction.name ) return;
                        units = units.concat( faction.units );
                    });
                } else { // player units
                    units = this.shared.faction.units;
                }

                return units.filter( unit => _.unitInArea( unit, this.fromArea, {
                        basic : this.data.basicOnly,
                        notChampion : this.data.noChampion
                    } ));

            },


            currentAreaUnits(){
                return this.fromAreaUnits.filter( unit => unit.selected === this.area.name );
            },

            selected(){
                return this.fromAreaUnits.filter( unit => unit.selected );
            },

            canSave(){
                let unitsSelectedTest = this.selected.length >= 1;
                let costTest = ( this.shared.faction.resources + this.shared.faction.energy ) >= this.cost;
                return unitsSelectedTest && costTest;
            },

            toAreas(){
                let areas = [];
                this.data.toAreas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },

            cost(){
                let cost = 0;

                this.toAreas.forEach( area => {
                   let payoffs = _.policePayoffs( this.shared.faction, area );
                   if( this.fromAreaUnits.filter( unit => unit.selected === area.name ).length ){
                       cost += payoffs;
                   }
                });

                cost += _.vinesCost( this.shared.faction, this.selected, this.shared.data.factions );

                return cost;
            },



            data(){
                return this.shared.player.prompt.data;
            },

        }
    }
</script>


<style>

</style>

