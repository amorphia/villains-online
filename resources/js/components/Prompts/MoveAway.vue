<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title mb-4">{{ data.message }}</div>

                <!-- from areas -->
                <div class="mt-3 pb-4">
                    <area-flipper
                        :areas="[fromArea]"
                        locked="true"
                        index="0"
                        classes="area-header__units pt-0">
                        <unit-row :units="fromAreaUnits" @unit="addUnitToArea"></unit-row>
                    </area-flipper>
                </div>

                <!-- to areas -->
                <area-flipper :areas="toAreas"
                              :index="toAreaIndex"
                              classes="area-header__units"
                              @update="updateToIndex">
                    <unit-row :units="currentAreaUnits" @unit="removeUnitFromArea"></unit-row>
                </area-flipper>

                <!-- cost display -->
                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to move these units?` )"></div>

                <!-- resolve buttons -->
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
            /**
             * resolve prompt
             * @param option
             */
            resolve( option ){
                let data = this.setResolutionData( option );
                data = {...this.data, ...data };
                this.shared.respond( 'move-away', data );
            },

            /**
             * Set our resolution data
             * @param option
             * @returns {object}
             */
            setResolutionData( option ){
                // if we declined, return declined
                if( !option ) return { decline : true };

                // otherwise bundle our moves and our cost
                let result = { cost : this.cost };
                result.moves = this.selected.map( unit => {
                    return { units : [unit.id], toArea : unit.selected };
                });

                return result;
            },


            /**
             * Update our destination area index
             * @param index
             */
            updateToIndex( index ){
                this.toAreaIndex = index;
                if( this.data.limit === 1 && this.selected.length ) this.moveSelectedToArea();
            },


            /**
             * Move selected unit to our current destination area
             */
            moveSelectedToArea(){
                let unit = this.selected[0];
                this.$set( unit, 'selected', this.area.name );
            },


            /**
             * Add a unit to the selected area
             * @param unit
             */
            addUnitToArea( unit ){
                // if we already have moved our max units here, abort
                if( this.currentAreaUnits.length
                    || ( this.data.limit && this.selected.length >= this.data.limit ) ) return;

                // set unit selected area
                this.$set( unit, 'selected', this.area.name );
            },

            /**
             * Remove selected unit from area
             * @param unit
             */
            removeUnitFromArea( unit ){
                this.$set( unit, 'selected', null );
            },

        },

        computed : {

            /**
             * Return our from area object
             * @returns {Area}
             */
            fromArea(){
                return this.shared.data.areas[ this.data.fromArea ];
            },


            /**
             * Return our destination area object
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[ this.data.toAreas[this.toAreaIndex] ];
            },


            /**
             * Return the the units in our from area
             * @returns {Unit[]}
             */
            fromAreaUnits(){
                // get unit pool
                let units = this.getFromAreaUnitsPool();

                // filter pool
                return units.filter( unit => _.unitInArea( unit, this.fromArea, {
                        basic : this.data.basicOnly,
                        notChampion : this.data.noChampion
                    } ));
            },


            /**
             * Return our potential movable units pool
             *
             * @returns {Unit[]}
             */
            getFromAreaUnitsPool(){
                // if we aren't limited to enemy units, return our units
                if( ! this.data.enemyOnly ) return this.shared.faction.units;

                // otherwise return all enemy units
                let units = [];
                Object.values( this.shared.data.factions ).forEach( faction => {
                    if( faction.name === this.shared.faction.name ) return; // ignore our faction
                    units = units.concat( faction.units );
                });
                return units;
            },


            /**
             * Return the units in the current from area
             *
             * @returns {Unit[]}
             */
            currentAreaUnits(){
                return this.fromAreaUnits.filter( unit => unit.selected === this.area.name );
            },


            /**
             * Returns the selected units
             * @returns {Unit[]}
             */
            selected(){
                return this.fromAreaUnits.filter( unit => unit.selected );
            },


            /**
             * Can we save our choices?
             * @returns {boolean}
             */
            canSave(){
                // if we haven't selected any units, then no
                if( this.selected.length < 1) return false;

                // if we have enough money
                return _.money( this.shared.faction ) >= this.cost;
            },


            /**
             * Return area objects for our valid destination areas
             * @returns {Area[]}
             */
            toAreas(){
                let areas = [];
                this.data.toAreas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },


            /**
             * Calculated the cost for this move
             * @returns {number}
             */
            cost(){
                let cost = 0;

                // police payoffs
                this.toAreas.forEach( area => {
                   let payoffs = _.policePayoffs( this.shared.faction, area );
                   if( this.fromAreaUnits.filter( unit => unit.selected === area.name ).length ){
                       cost += payoffs;
                   }
                });

                // vines
                cost += _.vinesCost( this.shared.faction, this.selected, this.shared.data.factions );

                return cost;
            },


            /**
             * Returns prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },

        }
    }
</script>


