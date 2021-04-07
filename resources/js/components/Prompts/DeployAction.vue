<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">


                <div class="title mb-4">Choose units to deploy</div>
                <div class="mt-3 pb-4">

                    <area-flipper
                        v-if="fromAreaIndex === -1"
                        :areas="fromAreas"
                        :index="fromAreaIndex"
                        isReserves="true"
                        :hasReserves="reserves.length"
                        @update="updateFromIndex">
                        <unit-set :units="reserves" classes="center-text p-0" noBorder="true" @unitClicked="addUnitFromReserves"></unit-set>
                    </area-flipper>

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
                    <div class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>

                    <!-- deploy limit pips -->
                    <div class="deploy-limit__pips d-flex justify-center flex-wrap mt-3">
                        <!-- default deploy limit -->
                        <i v-for="(n, index) in data.deployLimit"
                           class="deploy-limit__pip"
                           :class="index < usedDeploy ? 'icon-circle active' : 'icon-circle-open'"></i>

                        <i v-if="showBonusPips" v-for="(n, index) in bonusDeployCount"
                           class="deploy-limit__pip commie-pip"
                           :class="index < bonusUnitsInDeploy ? 'icon-circle active' : 'icon-circle-open'"></i>
                    </div>

                    <div class="popout-hud__block p-3 pos-relative"
                         :class="{ 'has-ghosts' : shared.faction.ghostDeploy }"
                         v-for="(units, location) in groupBy( selected, 'location' )"
                         :data-count="location !== 'null' ? location : 'reserves'">
                        <div v-for="unit in units" class="units-hud__unit d-inline-block pos-relative" :class="{'deploy__ghost' : unit.asGhost }">
                            <img
                                 class="unit-hud__unit-image"
                                 @click="unit.selected = false"
                                 :src="`/images/factions/${unit.faction}/units/${unit.type}${(unit.flipped || unit.asGhost) ? '-flipped' : ''}.png`">
                            <div v-if="shared.faction.ghostDeploy" class="pointer deploy__toggle-ghost" @click="toggleGhost( unit )">{{ !unit.asGhost ? 'non-' : '' }}ghost</div>
                        </div>
                    </div>
                </area-flipper>

                <div v-if="destinationBlockedByKau" class="prompt-question red">Kau is blocking champions from being moved to this area</div>
                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to deploy these units?` )"></div>
                <div v-if="vinesCost > 0" class="prompt-question red center-text" v-html="shared.filterText( `Vines cost xC${vinesCost}x` )"></div>
                <div v-if="policePayoffs > 0" class="prompt-question red center-text" v-html="shared.filterText( `Police Payoff cost xC${policePayoffs}x` )"></div>


                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )"
                            v-if="canDecline">decline</button>
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="!canSave">deploy selected units</button>
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
                if( this.fromAreaIndex === -1 ){
                    App.event.emit('unselectAreas' );
                }
            },

            destinationBlockedByKau(){
                if( !this.destinationBlockedByKau ) return;

                this.selected.forEach( unit => {
                    if( unit.type === 'champion' ) this.$set( unit, 'selected', false );
                })
            }
        },

        mounted(){
            // if we have nothing to deploy from our reserves
            if( this.reserves.length === 0 && this.fromAreas.length > 0 ) this.fromAreaIndex = 0;

            // if we have no units to deploy at all
            if( this.reserves.length === 0 && this.fromAreas.length === 0 ) this.fromAreaIndex = -2;
        },

        methods : {

            toggleGhost( unit ){
                if( unit.asGhost ) this.$set( unit, 'asGhost', false );
                else this.$set( unit, 'asGhost', true );
            },

            resolve( option ){
                let data = {};

                if( !option ){
                    data.decline = true;
                } else {
                    data.toArea = this.area.name;
                    data.units = this.selected.filter( unit => !unit.asGhost ).map( unit => unit.id );
                    data.ghosts = this.selected.filter( unit => unit.asGhost ).map( unit => unit.id );
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
                if( this.shared.faction.bonusDeploy && this.data.fromToken ){
                    usedDeploy = this.nonBonusUsedDeploy;
                    usedDeploy += this.netBonusUnits > 0 ? this.netBonusUnits : 0;
                    if( this.netBonusUnits < 0 && type === this.shared.faction.bonusDeploy.type ) deployLimit++;
                }

                return usedDeploy < deployLimit;
            },

            addUnitFromPlay( unit ){
                if( unit.selected ){
                    this.$set( unit, 'selected', false);
                    if( unit.asGhost ) this.$set( unit, 'asGhost', false );
                    return;
                }
                if( ! this.canAddUnit( unit.type ) ) return;
                unit = _.find( this.currentFromAreaUnits, old => unit.id === old.id );
                this.$set( unit, 'selected', true );
                if( this.shared.faction.ghostDeploy ) this.$set( unit, 'asGhost', true );
            },


            addUnitFromReserves( type ){
                if( ! this.canAddUnit( type ) ) return;
                let unit = _.find( this.reserves, unit => unit.type === type );
                this.$set( unit, 'selected', true );
                if( this.shared.faction.ghostDeploy && !this.data.free ) this.$set( unit, 'asGhost', true );
            },


            groupBy( array, prop ){
                return _.groupBy( array, prop );
            },

            fromAreaUnits( area ){
                let units = this.shared.faction.units
                    .filter( unit => ! unit.noDeploy
                            && _.unitInArea( unit, area )
                            && unit.cost <= _.money( this.shared.faction )
                            && (unit.type !== 'champion' || !this.destinationBlockedByKau )
                            && (! this.data.unitTypes || this.data.unitTypes.includes( unit.type ) )
                    );

                if( this.shared.faction.ghostDeploy ){
                    let ghosts = this.shared.faction.ghosts.filter( unit => unit.location === area
                            && ( !this.data.unitTypes || this.data.unitTypes.includes( unit.type ) )
                        );

                    units = _.concat( units, ghosts );
                }

                return units;
            },
        },

        computed : {

            bonusDeployCount(){
                if( ! this.showBonusPips ) return 0;
                return this.shared.faction.bonusDeploy.count;
            },

            showBonusPips() {
                return this.shared.faction.hasOwnProperty( 'bonusDeploy' ) && this.data.fromToken  && !this.data.noBonusUnits;
            },

            netBonusUnits() {
                if( ! this.shared.faction.bonusDeploy || this.data.noBonusUnits ) return 0;
                return this.bonusUnitsInDeploy - this.shared.faction.bonusDeploy.count;
            },

            bonusUnitsInDeploy() {
                if( !this.shared.faction.bonusDeploy || this.data.noBonusUnits  ) return 0;
                return this.selected.filter(unit => unit.type === this.shared.faction.bonusDeploy.type ).length;
            },

            nonBonusUsedDeploy(){
                if( !this.shared.faction.bonusDeploy || this.data.noBonusUnits ) return this.selected.length;
                return this.selected.filter( unit => unit.type !== this.shared.faction.bonusDeploy.type ).length;
            },

            usedDeploy(){
                if( this.shared.faction.bonusDeploy && this.data.fromToken && !this.data.noBonusUnits  ){
                    let usedDeploy = this.nonBonusUsedDeploy;
                    usedDeploy += this.netBonusUnits > 0 ? this.netBonusUnits : 0;
                    return usedDeploy;
                }

                return this.selected.length;
            },

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
                return this.shared.faction.units.filter(
                    unit => !unit.selected
                            && ( !this.data.unitTypes || this.data.unitTypes.includes( unit.type ) )
                            && !unit.noDeploy
                            && unit.cost <= _.money( this.shared.faction )
                            && (unit.type !== 'champion' || !this.destinationBlockedByKau)
                            && !unit.location
                );
            },

            destinationBlockedByKau(){
                let aliens = this.shared.data.factions['aliens'];
                if( !aliens || this.shared.faction.name === 'aliens' ) return false;
                if( this.area.name === aliens.kau.location ) return true;
            },

            selected(){
                let units = this.shared.faction.units.filter( unit => unit.selected );

                if( this.shared.faction.ghostDeploy ){
                    units = _.concat( units, this.shared.faction.ghosts.filter( unit => unit.selected ) );
                }

                return units;
            },

            policePayoffs(){
                return _.policePayoffs( this.shared.faction, this.area, this.selected ) * this.selected.length;
            },

            vinesCost(){
                return _.vinesCost( this.shared.faction, this.selected, this.shared.data.factions );
            },

            unitCost(){
                let cost = 0;

                if( !this.data.free ) {
                    this.selected.forEach( unit => {
                        if( !(unit.redeployFree && unit.location) && !unit.asGhost ) cost += unit.cost;
                    });
                }

                return cost;
            },

            cost(){
                let baseCost = this.unitCost + this.policePayoffs + this.vinesCost;
                if( baseCost && this.data.reduceCost ) baseCost -= this.data.reduceCost;
                if( baseCost < 0 ) baseCost = 0;
                return baseCost;
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

    .deploy-limit__pips {
        margin-top: -.75rem;
    }

    .deploy-limit__pip {
        display: block;
        padding: .3em;
        color: white;
        text-shadow: 0 1px 2px black, 0 0 2px black, 0 0 2px black;
    }

    .deploy-limit__pip.active {
        color: var(--highlight-color);
    }

    .deploy-limit__pip.commie-pip, .deploy-limit__pip.commie-pip.active {
        color: red;
    }

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

    .units-hud__unit.deploy__ghost:before {
        content: "";
        position: absolute;
        width: 40%;
        height: 40%;
        /* background-image: url(/images/icons/ghost.png); */
        z-index: 3;
        left: 50%;
        top: 25%;
        background-repeat: no-repeat;
        background-size: contain;
        transform: translate(-50%, -70%);
    }

    .has-ghosts .units-hud__unit {
        height: 8vw;
    }

    .deploy__ghost .unit-hud__unit-image {
        /*  opacity: .8; */
    }

    .deploy__toggle-ghost {
        background-color: #192236;
    }

    .deploy__ghost .deploy__toggle-ghost {
        background-color: var(--faction-ghosts);
    }

</style>

