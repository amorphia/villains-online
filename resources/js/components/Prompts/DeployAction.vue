<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title mb-4">Choose units to deploy</div>

                <!-- from areas -->
                <div class="mt-3 pb-4">
                    <!-- reserves -->
                    <area-flipper
                        v-if="fromAreaIndex === -1"
                        :areas="fromAreas"
                        :index="fromAreaIndex"
                        isReserves="true"
                        :hasReserves="1"
                        @update="updateFromIndex">
                        <div v-if="!reserves.length" class="prompt-question center-text no-valid-reserves">No valid units in reserves</div>
                        <unit-set :units="reserves" classes="center-text p-0" noBorder="true" @unitClicked="addUnitFromReserves"></unit-set>
                    </area-flipper>

                    <!-- areas where we can deploy units from -->
                    <area-flipper
                        v-if="fromAreaIndex !== -1"
                        :areas="fromAreas"
                        :index="fromAreaIndex"
                        :hasReserves="1"
                        classes="area-header__units pt-0"
                        @update="updateFromIndex">
                            <div class="toggle area-map__toggle top-0 left-0">Re-deploy from the {{ fromAreas[fromAreaIndex].name }}</div>
                            <unit-row :units="currentFromAreaUnits" @unit="addUnitFromPlay"></unit-row>
                    </area-flipper>
                </div>

                <!-- destination area -->
                <area-flipper :areas="toAreas" locked="true" :index="toAreaIndex" @update="updateToIndex" classes="area-header__units">

                    <!-- area zoom -->
                    <div class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>

                    <!-- deploy limit pips -->
                    <div class="deploy-limit__pips d-flex justify-center flex-wrap mt-3">

                        <!-- base deploy limit -->
                        <i v-for="(n, index) in data.deployLimit"
                           class="deploy-limit__pip"
                           :class="index < usedDeploy ? 'icon-circle active' : 'icon-circle-open'"></i>

                        <!-- bonus type specific deploy limit -->
                        <i v-if="showBonusPips" v-for="(n, index) in bonusDeployCount"
                           class="deploy-limit__pip commie-pip"
                           :class="index < bonusUnitsInDeploy ? 'icon-circle active' : 'icon-circle-open'"></i>
                    </div>

                    <!-- selected units -->
                    <div class="d-flex align-center justify-center">
                        <div class="popout-hud__block d-inline-flex align-center p-3 pos-relative"
                             :class="{ 'has-toggle' : hasToggleUnits }"
                             v-for="(units, location) in groupBy( selected, 'location' )"
                             :data-count="location !== 'null' ? location : 'reserves'">
                            <div v-for="unit in units" class="units-hud__unit pos-relative" style="display: inline-flex">
                                <div>
                                    <deploy-unit-icon
                                        @clicked="unit.selected = false"
                                        :unit="unit"
                                    />
                                    <div v-if="unit.canDeployFlipped" class="pointer deploy__toggle-ghost" @click="toggleFlipped( unit )">{{ !unit.deployFlipped ? 'non-' : '' }}flipped</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </area-flipper>

                <!-- Kau blocking area text -->
                <div v-if="destinationBlockedByKau" class="prompt-question red">Kau is blocking champions from being moved to this area</div>

                <!-- total cost -->
                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to deploy these units?` )"></div>

                <!-- vines cost -->
                <div v-if="vinesCost > 0" class="prompt-question red center-text" v-html="shared.filterText( `Vines cost xC${vinesCost}x` )"></div>

                <!-- police payoff cost -->
                <div v-if="policePayoffs > 0" class="prompt-question red center-text" v-html="shared.filterText( `Police Payoff cost xC${policePayoffs}x` )"></div>

                <!-- submit buttons -->
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
    import DeployUnitIcon from "../Units/DeployUnitIcon";
    export default {

        name: 'deploy-action',
        components: {DeployUnitIcon},
        data() {
            return {
                shared : App.state,
                toAreaIndex : 0,
                fromAreaIndex : -1
            };
        },

        watch : {
            // unselect all areas when we choose our reserves
            fromAreaIndex(){
                if( this.fromAreaIndex === -1 ){
                    App.event.emit('unselectAreas' );
                }
            },

            // when our destination becomes blocked by kau, remove all champions from our selection
            destinationBlockedByKau(){
                if( !this.destinationBlockedByKau ) return;

                this.selected.forEach( unit => {
                    if( _.isChampion( unit ) ) this.$set( unit, 'selected', false );
                })
            }
        },

        mounted(){
            // if we have nothing to deploy from our reserves set our fromIndex to 0
            //if( this.reserves.length === 0 && this.fromAreas.length > 0 ) this.fromAreaIndex = 0;

            // if we have no units to deploy at all set our from index to -2
            if( this.reserves.length === 0 && this.fromAreas.length === 0 ) this.fromAreaIndex = -2;
        },

        methods : {
            /**
             * Toggle whether to deploy a unit as a ghost
             * @param unit
             */
            toggleFlipped( unit ){
                if( unit.deployFlipped ){
                    this.$set( unit, 'deployFlipped', false );
                    return;
                }

                this.$set( unit, 'deployFlipped', true );
            },


            /**
             * Resolve this prompt
             * @param option
             */
            resolve( option ){
                let data = this.getResponseData( option );
                data = { ...this.data, ...data  };

                let toBeFlipped = this.selected.filter( unit => unit.deployFlipped ).map( unit => unit.id );
                if( toBeFlipped?.length ) data.toBeFlipped = toBeFlipped;

                console.log("resolve deploy data", data);

                this.shared.respond( 'deploy-action', data );
            },


            /**
             * Get our response data
             * @param option
             * @returns {object}
             */
            getResponseData( option ){
                // if we declined...
                if( !option ) return { decline : true };

                return {
                    toArea : this.area.name,
                    units : this.selected.filter( unit => !unit.asGhost ).map( unit => unit.id ),
                    ghosts : this.selected.filter( unit => unit.asGhost ).map( unit => unit.id ),
                    cost : this.cost,
                }
            },


            /**
             * Update our destination area index
             * @param index
             */
            updateToIndex( index ){
                this.toAreaIndex = index;
            },


            /**
             * Update our from area index
             * @param index
             */
            updateFromIndex( index ){
                this.fromAreaIndex = index;
            },


            /**
             * Switch to selecting from our reserves
             */
            switchToReserves(){
                // if we are already selecting the reserves, abort
                if( this.fromAreaIndex === -1 ) return;

                this.fromAreaIndex = -1;
                this.shared.event.emit('unselectAreas' );
            },


            /**
             * Switch from our reserves, to redeploying from an area
             */
            switchToRedeploy(){
                // if we are already redeploying, abort
                if( this.fromAreaIndex !== -1 ) return;

                this.fromAreaIndex = 0;
                this.shared.event.emit('areaSelected', this.fromAreas[this.fromAreaIndex] );
            },


            /**
             * Can we add this unit?
             * @param unit
             * @returns {boolean}
             */
            canAddUnit( unit ){
                let usedDeploy = this.selected.length;
                let deployLimit = this.data.deployLimit;
                let bonusDeploy = this.shared.faction.bonusDeploy;

                // unit type specific bonus deploy
                if( bonusDeploy && this.data.fromToken ){
                    usedDeploy = this.nonBonusUsedDeploy;
                    usedDeploy += this.netBonusUnits > 0 ? this.netBonusUnits : 0;

                    if( this.netBonusUnits < 0 && bonusDeploy.type && unit.type === bonusDeploy.type ) {
                            deployLimit++;
                    }

                    if( this.netBonusUnits < 0 && bonusDeploy.inPlay && unit.location ) {
                        deployLimit++;
                    }
                }

                return usedDeploy < deployLimit;
            },


            /**
             * Add a unit from play
             * @param unit
             */
            addUnitFromPlay( unit ){
                // unselect the unit if it was already selected
                if( unit.selected ){
                    this.$set( unit, 'selected', false);
                    if( unit.asGhost ) this.$set( unit, 'asGhost', false );
                    return;
                }

                // if we can't add this unit abort
                if( ! this.canAddUnit( unit ) ) return;

                // get our unit and select it
                unit = _.find( this.currentFromAreaUnits, old => unit.id === old.id );
                this.$set( unit, 'selected', true );

                // do our ghost shenanigans
                if( this.shared.faction.ghostDeploy ) this.$set( unit, 'asGhost', true );
            },


            /**
             * Add a unit from our reserves
             * @param type
             */
            addUnitFromReserves( type ){
                // if we can't add this unit abort
                if( ! this.canAddUnit( { type: type } ) ) return;

                // get our unit and select it
                let unit = _.find( this.reserves, unit => unit.type === type );
                this.$set( unit, 'selected', true );

                // do our ghost shenanigans
                if( this.shared.faction.ghostDeploy && !this.data.free ) this.$set( unit, 'asGhost', true );
            },


            /**
             * Group array by prop helper
             *
             * @param array
             * @param prop
             * @returns {Object}
             */
            groupBy( array, prop ){
                return _.groupBy( array, prop );
            },


            /**
             * Return from area units
             * @param area
             * @returns {Array}
             */
            fromAreaUnits( area ){
                // get our units
                let units = this.shared.faction.units
                    .filter( unit => ( this.data.free || unit.cost <= _.money( this.shared.faction ) || unit.redeployFree )
                            && _.unitInArea( unit, area, {
                                deployable : true,
                                notChampion : this.destinationBlockedByKau || this.data.basicOnly,
                                skilled : this.data.isSkilled,
                                types : this.data.unitTypes,
                        }));

                /*
                // include any ghosts
                if( this.shared.faction.ghostDeploy ){

                    let ghosts = this.shared.faction.ghosts.filter( unit => unit.location === area
                            && ( !this.data.unitTypes || this.data.unitTypes.includes( unit.type ) )
                        );

                    for( let ghost of ghosts ){
                        units.push( ghost );
                    }
                }
                */

                return units;
            },
        },

        computed : {

            /**
             * Return our bonus deploy count
             * @returns {number}
             */
            bonusDeployCount(){
                if( ! this.showBonusPips ) return 0;
                return this.shared.faction.bonusDeploy.count;
            },


            /**
             * Should we show any bonus pips?
             * @returns {boolean}
             */
            showBonusPips() {
                return this.shared.faction.hasOwnProperty( 'bonusDeploy' ) && this.data.fromToken  && !this.data.noBonusUnits;
            },


            /**
             * Calculate our net bonus units
             * @returns {number}
             */
            netBonusUnits() {
                if( ! this.shared.faction.bonusDeploy || this.data.noBonusUnits ) return 0;
                return this.bonusUnitsInDeploy - this.shared.faction.bonusDeploy.count;
            },


            /**
             * Count our bonus units being deployed
             * @returns {number}
             */
            bonusUnitsInDeploy() {
                if( !this.shared.faction.bonusDeploy || this.data.noBonusUnits  ) return 0;

                // bonus by type
                if(this.shared.faction.bonusDeploy.type){
                    return this.selected.filter(unit => unit.type === this.shared.faction.bonusDeploy.type ).length;
                }

                // bonus in play
                if(this.shared.faction.bonusDeploy.inPlay){
                    return this.selected.filter(unit => unit.location ).length;
                }
            },

            hasToggleUnits(){
                return this.selected.some( unit => unit.canDeployFlipped );
            },

            /**
             * How much of our base deploy have we used?
             * @returns {number}
             */
            nonBonusUsedDeploy(){
                const bonusDeploy = this.shared.faction.bonusDeploy;

                if( !bonusDeploy || this.data.noBonusUnits ) return this.selected.length;

                // bonus by type
                if(bonusDeploy.type) {
                    return this.selected.filter(unit => unit.type !== bonusDeploy.type).length;
                }

                // bonus in play
                if(bonusDeploy.inPlay){
                    return this.selected.filter(unit => !unit.location ).length;
                }
            },


            /**
             * How much of our deploy limit have we used?
             * @returns {number}
             */
            usedDeploy(){
                if( this.shared.faction.bonusDeploy && this.data.fromToken && !this.data.noBonusUnits  ){
                    let usedDeploy = this.nonBonusUsedDeploy;
                    usedDeploy += this.netBonusUnits > 0 ? this.netBonusUnits : 0;
                    return usedDeploy;
                }

                return this.selected.length;
            },


            /**
             * Can we decline this action?
             * @returns {boolean}
             */
            canDecline(){
                // if this deploy action if from a token, then yes
                if( this.data.fromToken ) return true;

                if( this.data.canDecline ) return true;

                // if we have no units to deploy, then yes
                if( !this.reserves.length && !this.hasFromAreaUnits ) return true;

                // if we can't afford to deploy any units then we may decline
                return _.money( this.shared.faction ) < this.policePayoffs;
            },


            /**
             * Can we save our choices?
             * @returns {boolean}
             */
            canSave(){
                // if we don't have any units selected, then no
                if( this.selected.length < 1 ) return false;

                // can we afford to deploy this units?
                return _.money( this.shared.faction ) >= this.cost;
            },


            /**
             * Return our from area objects
             * @returns {Area[]}
             */
            fromAreas(){
                return this.data.fromAreas.map( areaName => this.shared.data.areas[areaName] );
            },


            /**
             * Do we have units in our from areas?
             */
            hasFromAreaUnits(){
                return this.data.fromAreas.some( area => this.fromAreaUnits( area ).length > 0 );
            },


            /**
             * Return our current area
             * @returns {Area}
             */
            currentArea(){
                return this.data.fromAreas[this.fromAreaIndex];
            },


            /**
             * Return our units in the current from area
             * @returns {Unit[]}
             */
            currentFromAreaUnits(){
                return this.fromAreaUnits( this.currentArea );
            },


            /**
             * Return the deployable units in our reserves
             * @returns {Unit[]}
             */
            reserves(){
                return this.shared.faction.units.filter(
                    unit => _.isValidUnit( unit, {
                        notSelected : true,
                        types : this.data.unitTypes,
                        skilled: this.data.isSkilled,
                        deployable: true,
                        notChampion : this.destinationBlockedByKau || this.data.basicOnly,
                        inReserves : true,
                    }) && ( unit.cost <= _.money( this.shared.faction ) || this.data.free || this.shared.faction.ghostDeploy )
                );
            },


            /**
             * Is our destination blocked by kau?
             * @returns {boolean}
             */
            destinationBlockedByKau(){
                let aliens = this.shared.data.factions['aliens'];
                if( !aliens || this.shared.faction.name === 'aliens' ) return false;
                if( this.area.name === aliens.kau.location && !aliens.kau.killed ) return true;
            },


            /**
             * Return our selected units
             * @returns {Unit[]}
             */
            selected(){
                let units = this.shared.faction.units.filter( unit => unit.selected );

                /*
                if( this.shared.faction.ghostDeploy ){
                    units = _.concat( units, this.shared.faction.ghosts.filter( unit => unit.selected ) );
                }
                */

                return units;
            },


            /**
             * Calculate our police payoff cost
             * @returns {number}
             */
            policePayoffs(){
                return _.policePayoffs( this.shared.faction, this.area ) * this.selected.length;
            },


            /**
             * Calculate our vines cost
             * @returns {*}
             */
            vinesCost(){
                return _.vinesCost( this.shared.faction, this.selected, this.shared.data.factions );
            },


            /**
             * Calculate our units cost
             * @returns {number}
             */
            unitCost(){
                // if this deploy is free, return 0
                if( this.data.free ) return 0;

                return this.selected.reduce( (cost, unit) => {
                    // if this unit is free to redeploy skip it
                    if( unit.redeployFree && unit.location ) return cost;

                    // if we are deploying as a ghost skip it
                    if( unit.asGhost ) return cost;

                    // otherwise add in this unit's cost
                    return cost += unit.cost;
                }, 0 );
            },


            /**
             * Calculate out total cost for this deploy
             * @returns {number}
             */
            cost(){
                let baseCost = this.unitCost + this.policePayoffs + this.vinesCost;
                if( baseCost && this.data.reduceCost ) baseCost -= this.data.reduceCost;
                if( baseCost < 0 ) baseCost = 0;
                return baseCost;
            },


            /**
             * Return prompt data
             * @returns {null}
             */
            data(){
                return this.shared.player.prompt.data;
            },


            /**
             * Return our destination area object
             * @returns {[]}
             */
            toAreas(){
                return this.data.toAreas.map( areaName => this.shared.data.areas[areaName] );
            },


            /**
             * Return our current from area
             * @returns {Area}
             */
            fromArea(){
                return this.shared.data.areas[ this.currentArea ];
            },


            /**
             * Return our current destination object area
             * @returns {Area}
             */
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

    .has-toggle .units-hud__unit {
        height: 8vw;
    }


    .deploy__toggle-ghost {
        background-color: #192236;
    }

    .deploy__ghost .deploy__toggle-ghost {
        background-color: var(--faction-ghosts);
    }

    .no-valid-reserves {
        background-color: rgba(0,0,0,.5);
        padding: 2rem;
    }

</style>

