<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-6">
            <div class="width-100 d-flex justify-center flex-column align-center">


                <div class="title mb-4">Choose units to move</div>
                <div class="mt-3 pb-4">
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
                    <div v-if="data.moveLimit" class="toggle area-map__toggle top-0 left-0">Move Limit: {{ selected.length }} / {{ data.moveLimit }}</div>

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
                </area-flipper>

                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to move these units?` )"></div>

                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )"
                            v-if="canDecline">decline</button>
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="canSave !== true">move selected units</button>
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
                fromAreaIndex : 0
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
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, area ) );
            },
        },

        computed : {

            canDecline(){
                if( this.data.fromToken ) return true;
                return !this.hasFromAreaUnits || ( this.shared.faction.resources + this.shared.faction.energy) < this.policePayoffs;
            },

            canSave(){
                let unitsSelectedTest = this.selected.length >= 1;
                let costTest = (this.shared.faction.resources + this.shared.faction.energy) >= this.cost;
                return unitsSelectedTest && costTest;
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
                let policePayoff = 0;

                _.forEach( this.area.cards, card => {
                    if( card.class === 'police-payoff' // if there is a police payoff here
                        && card.owner !== this.shared.faction.name // which we don't own
                        && !_.hasKauImmunity( this.shared.faction, this.area ) // and we don't already have kau immunity in this area
                        && !_.find(this.selected, unit => unit.type === 'champion' && unit.faction === 'aliens' ) ) // and we aren't deploying kau
                    {
                        policePayoff++; // increase out police payoff cost by one
                    }
                });

                return policePayoff;
            },

            cost(){
                let cost = 0;
                cost += this.policePayoffs * this.selected.length;
                return cost;
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

