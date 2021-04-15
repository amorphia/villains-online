<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-6">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title mb-4">{{ message }}</div>

                <!-- from areas -->
                <div v-if="!confirm" class="mt-3 pb-4">
                    <area-flipper
                        :areas="fromAreas"
                        :index="fromAreaIndex"
                        classes="area-header__units pt-0"
                        @update="updateFromIndex">
                        <div class="toggle area-map__toggle top-0 left-0">Move from the {{ fromAreas[fromAreaIndex].name }}</div>
                        <unit-row :units="currentFromAreaUnits" @unit="addUnitFromPlay"></unit-row>
                    </area-flipper>
                </div>

                <!-- to areas -->
                <area-flipper :areas="[area]" locked="true" :index="0" classes="area-header__units">
                    <div class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>

                    <!-- deploy limit pips -->
                    <div  v-if="data.moveLimit" class="deploy-limit__pips d-flex justify-center flex-wrap mt-3">
                        <!-- default deploy limit -->
                        <i v-for="(n, index) in data.moveLimit"
                           class="deploy-limit__pip"
                           :class="index < selected.length ? 'icon-circle active' : 'icon-circle-open'"></i>
                    </div>

                    <!-- selected units -->
                    <div class="popout-hud__block p-3 pos-relative"
                         v-for="(units, location) in groupBy( selected, 'location' )"
                         :data-count="location">
                        <div v-for="unit in units" class="units-hud__unit d-inline-block pos-relative">
                            <img
                                class="unit-hud__unit-image"
                                @click="unselectUnit( unit )"
                                :src="`/images/factions/${unit.faction}/units/${unit.type}${unit.flipped ? '-flipped' : ''}.png`">
                        </div>
                    </div>
                </area-flipper>

                <!-- kau block warning -->
                <div v-if="destinationBlockedByKau" class="prompt-question red">Kau is blocking champions from being moved to this area</div>

                <!-- cost display -->
                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to move these units?` )"></div>

                <!-- confirmation panel cost breakdown -->
                <div v-if="cost > 0 && confirm">
                    <div v-if="vinesCost > 0" class="prompt-question red center-text" v-html="shared.filterText( `Vines cost xC${vinesCost}x` )"></div>
                    <div v-if="policePayoffs > 0" class="prompt-question red center-text" v-html="shared.filterText( `Police Payoff cost xC${policePayoffs}x` )"></div>
                </div>

                <!-- buttons -->
                <div class="flex-center">
                    <!-- if confirming selection -->
                    <div v-if="confirm">
                        <button class="button button-empty" @click="confirm = false"
                                >back</button>
                        <button class="button"
                                @click="resolve( true )"
                                :disabled="canSave !== true">finalize move</button>
                    </div>
                    <!-- if still selecting -->
                    <div v-else>
                        <button class="button button-empty" @click="resolve( false )"
                                v-if="canDecline">decline move</button>
                        <button class="button"
                                @click="confirm = true"
                                :disabled="canSave !== true">confirm move</button>
                    </div>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'move-action',
        data() {
            return {
                shared : App.state,
                fromAreaIndex : 0,
                confirm : false,
            };
        },

        methods : {
            /**
             * Resolve prompt
             * @param option
             */
            resolve( option ){
                let data = this.getResolveData( option );
                data = { ...this.data, ...data };
                this.shared.respond( 'move-action', data );
            },


            /**
             * Get our resolve data object
             * @param option
             * @returns {object}
             */
            getResolveData( option ){
                // if we declined
                if( !option ) return { decline : true };

                return {
                    toArea : this.area.name,
                    units : _.map( this.selected, 'id' ),
                    cost : this.cost
                };
            },


            /**
             * Unselect a unit
             * @param unit
             */
            unselectUnit( unit ){
                if( ! this.confirm ) unit.selected = false;
            },


            /**
             * Update from area index
             * @param index
             */
            updateFromIndex( index ){
                this.fromAreaIndex = index;
            },


            /**
             * Add a unit from play
             * @param unit
             */
            addUnitFromPlay( unit ){
                // if we moved our max units, abort
                if( this.data.moveLimit && this.selected.length >= this.data.moveLimit ) return;

                unit = _.find( this.currentFromAreaUnits, old => unit.id === old.id );
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


            /**
             * Return our units in the from area
             *
             * @param area
             * @returns {Unit[]}
             */
            fromAreaUnits( area ){
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, area ) && (unit.type !== 'champion' || !this.destinationBlockedByKau ) );
            },
        },

        computed : {

            /**
             * Get our message
             * @returns {string}
             */
            message(){
                return this.confirm ? 'Are you sure you are done moving?' : 'Choose units to move';
            },


            /**
             * Can we decline this move
             * @returns {boolean}
             */
            canDecline(){
                // we can always decline moves from a token
                if( this.data.fromToken ) return true;

                // or if we don't have enough money
                return _.money( this.shared.faction ) < this.cost;
            },


            /**
             * Can we save our selection?
             * @returns {boolean}
             */
            canSave(){
                // if we haven't selected any units, then no
                if( this.selected.length < 1) return false;

                // otherwise do we have enough money?
                return _.money( this.shared.faction ) >= this.cost;
            },


            /**
             * Is our destination blocked bu Kau?
             * @returns {boolean}
             */
            destinationBlockedByKau(){
                let aliens = this.shared.data.factions['aliens'];
                if( !aliens || this.shared.faction.name === 'aliens' ) return false;
                if( this.area.name === aliens.kau.location && !aliens.kau.killed ) return true;
            },


            /**
             * Return our valid from area objects
             * @returns {Area[]}
             */
            fromAreas(){
                let areas = [];
                this.data.fromAreas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },


            /**
             * Returns our current from area name
             *
             * @returns {string}
             */
            currentAreaName(){
                return this.data.fromAreas[this.fromAreaIndex];
            },


            /**
             * Returns our current from area object
             *
             * @returns {Area}
             */
            currentFromAreaUnits(){
                return this.fromAreaUnits( this.currentAreaName );
            },


            /**
             * Returns our selected units
             *
             * @returns {Unit[]}
             */
            selected(){
                return this.shared.faction.units.filter( unit => unit.selected );
            },


            /**
             * Return the number of police payoffs active in our destination
             *
             * @returns {number}
             */
            policePayoffs(){
                return _.policePayoffs( this.shared.faction, this.area ) * this.selected.length;
            },


            /**
             * Return the vines cost to move our selected units
             *
             * @returns {number}
             */
            vinesCost(){
                return _.vinesCost( this.shared.faction, this.selected, this.shared.data.factions );
            },


            /**
             * Calculate our move cost
             * @returns {number}
             */
            cost(){
                let baseCost = this.policePayoffs + this.vinesCost;
                if( baseCost && this.data.reduceCost ) baseCost -= this.data.reduceCost;
                if( baseCost < 0 ) baseCost = 0;
                return baseCost;
            },


            /**
             * return our prompt data
             *
             * @returns {null}
             */
            data(){
                return this.shared.player.prompt.data;
            },


            /**
             * returns our current destination area object
             *
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[this.data.toArea];
            },


            /**
             * returns our current from area object
             *
             * @returns {Area}
             */
            fromArea(){
                return this.shared.data.areas[ this.currentAreaName ];
            },
        }
    }
</script>

