<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-6">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <div class="title mb-4">{{ message }}</div>



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

                <area-flipper :areas="[area]" locked="true" :index="0" classes="area-header__units">
                    <div class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>

                    <!-- deploy limit pips -->
                    <div  v-if="data.moveLimit" class="deploy-limit__pips d-flex justify-center flex-wrap mt-3">
                        <!-- default deploy limit -->
                        <i v-for="(n, index) in data.moveLimit"
                           class="deploy-limit__pip"
                           :class="index < selected.length ? 'icon-circle active' : 'icon-circle-open'"></i>
                    </div>

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

                <div v-if="destinationBlockedByKau" class="prompt-question red">Kau is blocking champions from being moved to this area</div>


                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to move these units?` )"></div>

                <div v-if="cost > 0 && confirm">
                    <div v-if="vinesCost > 0" class="prompt-question red center-text" v-html="shared.filterText( `Vines cost xC${vinesCost}x` )"></div>
                    <div v-if="policePayoffs > 0" class="prompt-question red center-text" v-html="shared.filterText( `Police Payoff cost xC${policePayoffs}x` )"></div>
                </div>

                <div class="flex-center">
                    <div v-if="confirm">
                        <button class="button button-empty" @click="confirm = false"
                                >back</button>
                        <button class="button"
                                @click="resolve( true )"
                                :disabled="canSave !== true">finalize move</button>
                    </div>
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
            resolve( option ){
                let data = {};

                if( !option ){
                    data.decline = true;
                } else {
                    data.toArea = this.area.name;
                    data.units = _.map( this.selected, 'id' );
                    data.cost = this.cost;
                }

                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'move-action', data );
            },

            unselectUnit( unit ){
                if( ! this.confirm ) unit.selected = false;
            },

            updateFromIndex( index ){
                this.fromAreaIndex = index;
            },

            addUnitFromPlay( unit ){
                if( this.data.moveLimit && this.selected.length >= this.data.moveLimit ) return;

                unit = _.find( this.currentFromAreaUnits, old => unit.id === old.id );
                this.$set( unit, 'selected', true );
            },

            groupBy( array, prop ){
                return _.groupBy( array, prop );
            },

            fromAreaUnits( area ){
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, area ) && (unit.type !== 'champion' || !this.destinationBlockedByKau ) );
            },
        },

        computed : {

            message(){
                return this.confirm ? 'Are you sure you are done moving?' : 'Choose units to move';
            },

            canDecline(){
                if( this.data.fromToken ) return true;
                return !this.hasFromAreaUnits || ( this.shared.faction.resources + this.shared.faction.energy) < this.policePayoffs;
            },

            canSave(){
                let unitsSelectedTest = this.selected.length >= 1;
                let costTest = (this.shared.faction.resources + this.shared.faction.energy) >= this.cost;
                return unitsSelectedTest && costTest;
            },

            destinationBlockedByKau(){
                let aliens = this.shared.data.factions['aliens'];
                if( !aliens || this.shared.faction.name === 'aliens' ) return false;
                if( this.area.name === aliens.kau.location ) return true;
            },

            fromAreas(){
                let areas = [];
                this.data.fromAreas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },

            hasFromAreaUnits(){
                this.data.fromAreas.forEach( area => {
                    if( this.fromAreaUnits( area ).length > 0 ) return true;
                });
            },

            currentArea(){
                return this.data.fromAreas[this.fromAreaIndex];
            },

            currentFromAreaUnits(){
                return this.fromAreaUnits( this.currentArea );
            },

            selected(){
                return this.shared.faction.units.filter( unit => unit.selected );
            },


            policePayoffs(){
                return _.policePayoffs( this.shared.faction, this.area, this.selected ) * this.selected.length;
            },

            vinesCost(){
                return _.vinesCost( this.shared.faction, this.selected, this.shared.data.factions );
            },

            cost(){
                let baseCost = this.policePayoffs + this.vinesCost;
                if( baseCost && this.data.reduceCost ) baseCost -= this.data.reduceCost;
                if( baseCost < 0 ) baseCost = 0;
                return baseCost;
            },

            data(){
                return this.shared.player.prompt.data;
            },

            area(){
                return this.shared.data.areas[this.data.toArea];
            },

            fromArea(){
                return this.shared.data.areas[ this.currentArea ];
            },
        }
    }
</script>


<style>

</style>

