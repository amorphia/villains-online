<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-2">
            <div class="width-100 d-flex justify-center flex-column align-center">


                <div class="title mb-4">Choose units to deploy</div>
                <div class="mt-3 pb-4">

                    <div v-if="fromAreaIndex === -1" class="px-3 width-100 d-flex justify-center">
                        <button v-if="fromAreas.length > 0" class="flipper" @click="fromAreaIndex = fromAreas.length - 1"><i class="icon-left"></i></button>
                        <div class="area-header unit-row p-4 pb-5 pos-relative area-header-reserves">
                            <unit-set :units="reserves" classes="center-text p-0" noBorder="true" @unitClicked="addUnitFromReserves"></unit-set>
                        </div>
                        <button v-if="fromAreas.length > 0" class="flipper" @click="fromAreaIndex = 0"><i class="icon-right"></i></button>
                    </div>


                    <area-flipper
                        v-if="fromAreaIndex !== -1"
                        :areas="fromAreas"
                        :index="fromAreaIndex"
                        :hasReserves="reserves.length"
                        classes="area-header__units pt-0"
                        @update="updateFromIndex">
                            <div class="toggle area-map__toggle top-0 left-0">Re-deploy from the {{ fromAreas[fromAreaIndex].name }}</div>
                            <unit-row :units="currentFromAreaUnits" @unit="addUnitFromPlay"></unit-row>
                    </area-flipper>

                </div>
                <area-flipper :areas="toAreas" locked="true" :index="toAreaIndex" @update="updateToIndex" classes="area-header__units">
                    <div class="toggle area-map__toggle top-0 left-0">Deploy Limit: {{ selected.length }} / {{ data.deployLimit }} {{ shared.faction.bonusPatsies ? `[+${shared.faction.bonusPatsies} patsy]` : ''  }}</div>
                    <div class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>
                    <div class="popout-hud__block p-3 pos-relative"
                         v-for="(units, location) in groupBy( selected, 'location' )"
                         :data-count="location !== 'null' ? location : 'reserves'">
                        <div v-for="unit in units" class="units-hud__unit d-inline-block pos-relative">
                            <img
                                 class="unit-hud__unit-image"
                                 @click="unit.selected = false"
                                 :src="`/images/factions/${unit.faction}/units/${unit.type}${unit.flipped ? '-flipped' : ''}.png`">
                        </div>
                    </div>
                </area-flipper>

                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to deploy these units?` )"></div>

                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )"
                            v-if="canDecline">decline</button>
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

        name: 'deploy-action',
        data() {
            return {
                shared : App.state,
                toAreaIndex : 0,
                fromAreaIndex : -1
            };
        },

        watch : {
            fromAreaIndex(){
                if( this.fromAreaIndex === -1 ) App.event.emit('unselectAreas' );
            }
        },

        mounted(){
            // if we have nothing to deploy from our reserves
            if( this.reserves.length === 0 && this.fromAreas.length > 0 ) this.fromAreaIndex = 0;

            // if we have no units to deploy at all
            if( this.reserves.length === 0 && this.fromAreas.length === 0 ) this.fromAreaIndex = -2;
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
                this.shared.respond( 'deploy-action', data );
            },

            updateToIndex( index ){
                this.toAreaIndex = index;
            },

            updateFromIndex( index ){
                this.fromAreaIndex = index;
            },

            switchToReserves(){
                if( this.fromAreaIndex !== -1 ) {
                    this.fromAreaIndex = -1;
                    this.shared.event.emit('unselectAreas' );
                }
            },

            switchToRedeploy(){
                if( this.fromAreaIndex === -1 ){
                    this.fromAreaIndex = 0;
                    this.shared.event.emit('areaSelected', this.fromAreas[this.fromAreaIndex] );
                }
            },

            canAddUnit( type ){

                let usedDeploy = this.selected.length;
                let deployLimit = this.data.deployLimit;

                // commie bonus patsies
                if( this.shared.faction.bonusPatsies && this.data.fromToken ){

                    // non-patsies always count against our deploy limit
                    usedDeploy = this.selected.filter( unit => unit.type !== 'patsy' ).length;

                    let patsiesInDeploy = this.selected.filter( unit => unit.type === 'patsy' ).length;
                    let netPatsies = patsiesInDeploy - this.shared.faction.bonusPatsies;
                    usedDeploy += netPatsies > 0 ? netPatsies : 0;

                    if( netPatsies < 0 && type === 'patsy' ) deployLimit++;
                }

                return usedDeploy < deployLimit;
            },

            addUnitFromPlay( unit ){
                if( unit.selected ){
                    this.$set( unit, 'selected', false);
                    return;
                }
                if( ! this.canAddUnit( unit.type ) ) return;
                unit = _.find( this.currentFromAreaUnits, old => unit.id === old.id );
                this.$set( unit, 'selected', true );
            },


            addUnitFromReserves( type ){
                if( ! this.canAddUnit( type ) ) return;
                let unit = _.find( this.reserves, unit => unit.type === type );
                this.$set( unit, 'selected', true );
            },


            groupBy( array, prop ){
                return _.groupBy( array, prop );
            },

            fromAreaUnits( area ){
                return this.shared.faction.units.filter( unit => {
                    return !(
                        ! unit.hasOwnProperty( 'cost ')
                        || ! _.unitInArea( unit, area )
                        || this.data.unitTypes && !this.data.unitTypes.includes( unit.type )
                        || this.data.invalidId === unit.id
                    );
                });
            },
        },

        computed : {

            canDecline(){
                if( this.data.fromToken ) return true;
                return ( !this.reserves.length && !this.hasFromAreaUnits )
                    || ( this.shared.faction.resources + this.shared.faction.energy) < this.policePayoffs;
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

            reserves(){
                if( this.data.unitTypes ){
                    return this.shared.faction.units.filter( unit => !unit.selected && !unit.location && this.data.unitTypes.includes( unit.type ) );
                }

                return this.shared.faction.units.filter( unit => !unit.noDeploy && !unit.selected && !unit.location );
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
                if( !this.data.free ) {
                    this.selected.forEach(unit => {
                        cost += unit.cost;
                    });
                }

                cost += this.policePayoffs * this.selected.length;
                return cost;
            },

            data(){
                return this.shared.player.prompt.data;
            },

            toAreas(){
                let areas = [];
                this.data.toAreas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },

            fromArea(){
                return this.shared.data.areas[ this.currentArea ];
            },

            area(){
                return this.shared.data.areas[ this.data.toAreas[this.toAreaIndex] ];
            }
        }
    }
</script>


<style>

    .area-header__units{
        text-align: center;
        min-height: 13.5rem;
        padding-bottom: 1.5rem;
    }

    .deploy__collection-button {
        padding: .75rem 1.5rem;
        background-color: rgba(0,0,0,.5);
        color: white;
        margin: 0 .25rem;
    }

    .deploy__collection-button.active {
        color: var(--highlight-color);
    }

    .choose-action{
        max-height: 100%;
    }

</style>

