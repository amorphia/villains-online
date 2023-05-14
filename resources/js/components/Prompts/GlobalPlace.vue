<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title mb-4">{{ message }}</div>

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
                            <div class="toggle area-map__toggle top-0 left-0">Place from the {{ fromAreas[fromAreaIndex].name }}</div>
                            <unit-row :units="currentFromAreaUnits" @unit="addUnitFromPlay"></unit-row>
                    </area-flipper>
                </div>

                <!-- destination area -->
                <area-flipper :areas="[area]" locked="true" classes="area-header__units">

                    <!-- area zoom -->
                    <div class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>

                    <!-- deploy limit pips -->
                    <div class="deploy-limit__pips d-flex justify-center flex-wrap mt-3">

                        <!-- base deploy limit -->
                        <i v-for="(n, index) in data.count"
                           class="deploy-limit__pip"
                           :class="index < usedDeploy ? 'icon-circle active' : 'icon-circle-open'"></i>
                    </div>

                    <!-- selected units -->
                    <div class="popout-hud__block p-3 pos-relative"
                         v-for="(units, location) in groupBy( selected, 'location' )"
                         :data-count="location !== 'null' ? location : 'reserves'">
                        <div v-for="unit in units" class="units-hud__unit d-inline-block pos-relative">
                            <img
                                 class="unit-hud__unit-image"
                                 @click="unit.selected = false"
                                 :src="`/images/factions/${unit.faction}/units/${unit.type}${(unit.flipped || unit.asGhost) ? '-flipped' : ''}.png`">
                        </div>
                    </div>
                </area-flipper>

                <!-- Kau blocking area text -->
                <div v-if="destinationBlockedByKau" class="prompt-question red">Kau is blocking champions from being placed in this area</div>

                <!-- submit buttons -->
                <div class="flex-center">
                    <button class="button button-empty" @click="resolve( false )"
                            v-if="canDecline">decline</button>
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="!canSave">place selected units</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'global-place',
        data() {
            return {
                shared : App.state,
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
                    if( unit.type === 'champion' || unit.isChampion ) this.$set( unit, 'selected', false );
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
             * Resolve this prompt
             * @param option
             */
            resolve( option ){
                let data = this.getResponseData( option );
                data = { ...this.data, ...data  };
                this.shared.respond( 'global-place', data );
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
                    area : this.area.name,
                    units : this.selected.map( unit => unit.id ),
                }
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
                let deployLimit = this.data.count;

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
                    return;
                }

                // if we can't add this unit abort
                if( ! this.canAddUnit( unit ) ) return;

                // get our unit and select it
                unit = _.find( this.currentFromAreaUnits, old => unit.id === old.id );
                this.$set( unit, 'selected', true );
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
                    .filter( unit => _.unitInArea( unit, area, {
                                notChampion : this.destinationBlockedByKau,
                                skilled : this.data.isSkilled,
                                types : this.data.unitTypes
                        }));

                return units;
            },
        },

        computed : {
            message(){
                return this.data.message ?? "Choose units to place";
            },

            /**
             * How much of our deploy limit have we used?
             * @returns {number}
             */
            usedDeploy(){
                return this.selected.length;
            },


            /**
             * Can we decline this action?
             * @returns {boolean}
             */
            canDecline(){
                // if this deploy action if from a token, then yes
                if( !this.data.required ) return true;

                // if we have no units to deploy, then yes
                if( !this.reserves.length && !this.hasFromAreaUnits ) return true;

                return false;
            },


            /**
             * Can we save our choices?
             * @returns {boolean}
             */
            canSave(){
                // if we don't have any units selected, then no
                if(!this.data.required){
                    return this.selected.length > 0;
                }

                return this.selected.length === this.data.count;
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
            currentFromArea(){
                return this.data.fromAreas[this.fromAreaIndex];
            },


            /**
             * Return our units in the current from area
             * @returns {Unit[]}
             */
            currentFromAreaUnits(){
                return this.fromAreaUnits( this.currentFromArea );
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
                        notChampion : this.destinationBlockedByKau,
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
            area(){
                return this.shared.data.areas[ this.data.area ];
            },


            /**
             * Return our current from area
             * @returns {Area}
             */
            fromArea(){
                return this.shared.data.areas[ this.currentFromArea ];
            },

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

