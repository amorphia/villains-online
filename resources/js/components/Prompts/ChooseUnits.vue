<template>
    <player-prompt>
        <div class="min-prompt-width px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- prompt title -->
                <div class="title" v-html="shared.filterText( message )"></div>

                <!-- area flipper / unit selection -->
                <area-flipper v-if="areas.length" :areas="areas" :index="index" @update="updateArea">

                    <!-- show how many units we've selected out of how many we need to -->
                    <div v-if="!data.hideMax" class="toggle area-map__toggle top-0 left-0">Selected: {{ selected.length }} / {{ data.count }}</div>

                    <!-- show the units in the current area we have to select from -->
                    <unit-row :units="areaUnits" @unit="unitClicked"></unit-row>

                    <!-- optionally show enemy units in the area -->
                    <div v-if="data.showEnemyUnits" class="opacity-7">
                        <unit-row v-for="(set, name) in enemyUnits"
                                  :units="set"
                                  :key="name"
                                   ></unit-row>
                    </div>

                </area-flipper>

                <!-- deploy limit pips -->
                <div v-if="!data.hideMax" class="d-flex justify-center flex-wrap mt-3">
                    <!-- default deploy limit -->
                    <i v-for="(n, index) in data.count"
                       class="deploy-limit__pip"
                       :class="index < selected.length ? 'icon-circle active' : 'icon-circle-open'"></i>
                </div>

                <!-- optionally show reserves -->
                <div v-if="data.showReserves" class="mt-3">
                    <div class="prompt-question center-text">The Parasites can infect these unit types</div>
                    <unit-row :units="reserves"></unit-row>
                </div>

                <!-- Display the cost of this selection, if any -->
                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to choose these units?` )"></div>

                <!-- submission buttons -->
                <div>
                    <button v-if="data.canDecline" class="button button-empty" @click="resolve( false )">DECLINE</button>
                    <button class="button" @click="resolve( true )" :disabled="!canSubmit">FINALIZE CHOICE</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-units',
        data() {
            return {
                shared : App.state,
                index : 0, // index of our current area
            };
        },

        computed : {

            /**
             * Calculate the cost to perform whatever action we've got going on
             *
             * @returns {number}
             */
            cost(){
                let cost = 0;
                // do we have to pay for a police payoff?
                if( this.data.policePayoff ) cost += _.policePayoffs( this.shared.faction, this.shared.data.areas[this.data.policePayoff] ) * this.selected.length;

                // do we have to pay for vines?
                if( this.data.vines ) cost += this.selected.length * this.data.vines;

                // do we have to pay to materialize ghosts?
                if( this.data.materialize ) cost += this.ghostAreaCost;

                // do we have a cost reduction effect in place?
                if( this.data.payCost ) cost += this.selected.reduce( ( cost, unit ) => cost += unit.cost, 0 );

                return cost;
            },


            /**
             * Determines if we need to pay 1 when materializing ghosts in 3+ areas
             *
             * @returns {number}
             */
            ghostAreaCost(){
                // if we aren't materializing then just fuggetabout it
                if( !this.data.materialize ) return 0;

                // cycle through selected units and get a count of the number of different areas
                // we have selected units in
                let areas = {};
                this.selected.forEach( unit => { areas[ unit.location ] = true;});
                areas = Object.keys( areas ).length;

                // if we have selected units in 3+ areas then we have to pay a cost of one, otherwise its free
                return areas >= 3 ? 1 : 0;
            },


            /**
             * Can we submit this prompt, or do we have an illegal selection?
             *
             * @returns {boolean}
             */
            canSubmit(){
                // do we have enough money?
                let hasEnoughMoney = this.cost <= _.money( this.shared.faction );

                // do we have no more units to select, or have we selected at least one unit and we have a optional maximum?
                let hasSelectedEnoughUnits = this.needToSelect === 0 || ( this.data.optionalMax && this.selected.length > 0 );

                // if both of the above are true, then we can submit, otherwise we gotta make another choice
                return hasEnoughMoney && hasSelectedEnoughUnits;
            },


            /**
             * Sometimes we want to see the enemy units in the area while making a choice
             *
             * @returns {Array}
             */
            enemyUnits(){
                // if we don't have the "showEnemyUnits" flag set in our options, then return an empty array
                if( !this.data.showEnemyUnits ) return [];

                // return the enemy units in the current area that meet our option flag
                return _.enemyUnitsInArea(
                    this.shared.faction,
                    this.area,
                    this.shared.data.factions,
                    {
                        basic : this.data.basicOnly,
                        notHidden : this.data.notHidden
                    }
                );
            },


            /**
             * Returns one unit of each type currently in reserves for a given player
             * if the "showReserves" option is set
             *
             * @returns {Array}
             */
            reserves(){
                // if we don't have the showReserves flag set, return an empty array
                if( !this.data.showReserves ) return [];

                // otherwise take the units belonging to the faction declared by the showReserves option
                // and cycle through them adding the first of each type to the collection
                let reserves = {};
                this.shared.data.factions[this.data.showReserves].units.forEach( unit => {
                    if( _.unitInReserves( unit, { basic : true } ) && !reserves[unit.type] ) reserves[unit.type] = unit;
                });

                // return an array of just the units
                return Object.values( reserves );
            },


            /**
             * Returns the title message for this prompt if explicitly given,
             * or generates a default based on the options present
             *
             * @returns {string}
             */
            message(){
                // if we are given an explicit message, use that
                if( this.data.message ) return this.data.message;

                // otherwise generate a default title from the options
                return `Choose ${this.data.count} ${this.data.playerOnly ? 'of your ' : ''}${this.data.revealedOnly ? 'revealed ' : '' }${ this.data.unrevealedOnly ? 'unrevealed ' : '' }${ this.data.enemyOnly ? 'enemy ' : '' }unit${ this.data.count > 1 ? 's' : '' }`;
            },


            /**
             * Return the full area object from the game data based on
             * the currently selected area name
             *
             * @returns {Object}
             */
            area(){
                // this.shared.data.areas is the core game data store
                // this.currentArea is the name of the currently selected area
                return this.shared.data.areas[ this.currentArea ];
            },


            /**
             *  Returns the current area name from the array of valid
             *  area names provided by the prompt options
             *
             * @returns {String}
             */
            currentArea(){
                // this.data.areas is an array of area names provided by the prompt data
                return this.data.areas[this.index];
            },


            /**
             * Return the full area objects from the game data for each of the area names
             * provided by the "areas" prompt data
             *
             * @returns {Array}
             */
            areas(){
                let areas = [];
                // this.data.areas is an array of area names provided by the prompt data
                // this.shared.data.areas is the core game data store
                this.data.areas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },


            /**
             * Return the number of units we still need to select in order to reach the number
             * provided by the prompt "count" option
             *
             * @returns {number}
             */
            needToSelect(){
                // if no "count" option was provided then we default to just needing one unit total
                if( !this.data.count ) return this.selected.length > 0 ? 0 : 1;

                // otherwise return the "count" option minus the number of units currently selected
                return this.data.count - this.selected.length;
            },

            /**
             * Returns the units in the unitsPool filtered by the currently selected area
             *
             * @returns {Array}
             */
            areaUnits(){
                return this.unitsPool.filter( unit => unit.location === this.area.name );
            },


            /**
             * Returns the total pool of units we have to select from for this action
             *
             * @returns {Array}
             */
            unitsPool(){
                let units = [];

                // let us start by cycling through each faction
                _.forEach( this.shared.data.factions, faction => {

                    // if this is an invalid faction per the options, then ignore it
                    if( this.isInvalidFaction( faction ) ) return;

                    // get our stating units for this faction
                    let factionUnits = this.getStartingFactionUnits( faction );

                    // filter out units per our options
                    factionUnits = this.filterFactionUnitsByOptions( factionUnits );

                    // merge this faction's units (if any) to the aggregate units array
                    units = _.concat( units, factionUnits );
                });

                return units;
            },


            /**
             * Returns the units currently trapped in webs but that still need to attack
             *
             * @returns {Array}
             */
            webbedButNeedsToAttack(){
                // The only time we  need to do this is when A) the spiders are in the game, and
                // B) during combat when a webbed unit might still be selectable for a retaliation
                // attack. So if either of these are not true, then just return an empty array
                if( !this.shared.data.factions['spiders'] || !this.data.needsToAttack  ) return [];

                // otherwise build an array of webbed units that need to attack,
                // are in the current area, and belong to the current player
                let units = [];
                units = this.shared.data.factions['spiders'].webs.filter( unit =>
                        unit.faction === this.shared.faction.name
                        && unit.location === this.area.name
                        && unit.needsToAttack
                    );

                return units;
            },


            /**
             * Returns the currently selected units from the units pool
             *
             * @returns {Array}
             */
            selected(){
                return this.unitsPool.filter( unit => unit.selected );
            },


            /**
             * Returns the prompt data options
             *
             * @returns {null|Object}
             */
            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            /**
             * Submit or decline our choices for this prompt
             *
             * @param unitsSelected
             */
            resolve( unitsSelected ){
                let data = {};

                if( unitsSelected ){ // if we selected units process our choices

                    // add the ids of the selected units to the data
                    data.units = _.map( this.selected, 'id' );
                    // apply any costs
                    data.cost = this.cost;
                    // explicitly specify the ghostAreaCost so we can broadcast it in the game log
                    data.areaCost = this.ghostAreaCost

                } else { // if we instead declined then make that explicit
                    data.decline = true;
                }

                // merge the data and respond
                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'choose-units', data );
            },


            /**
             * Update our currently selected area
             *
             * @param newIndex
             */
            updateArea( newIndex ){
                if( newIndex === this.index ) return;
                this.index = newIndex;
            },


            /**
             * Returns the array of units to be potentially added to the unit pool for a
             * given faction depending on the options supplied by the prompt
             *
             * @param faction
             * @returns {Array}
             */
            getStartingFactionUnits( faction ){
                // let's assume we are starting with the faction's unit array
                let factionUnits = faction.units;

                // but if we are looking for "ghosts only" then let's swap out to the ghosts array
                if( this.data.ghostOnly )  factionUnits = faction.ghosts ? faction.ghosts : [];

                // We need to add webbed units to the collection if we are looking for units that need to attack
                // since units can get moved into the webbed array from their owner's unit array mid-combat
                // but those webbed units may still need to be able to retaliate during combat
                factionUnits = _.concat( factionUnits, this.webbedButNeedsToAttack );

                return factionUnits;
            },


            /**
             * Filters a faction's units before adding them to the unit pool
             * depending on the options set in the prompt data
             *
             * @param factionUnits
             * @returns {Array}
             */
            filterFactionUnitsByOptions( factionUnits ){
                return factionUnits.filter( unit => {
                    // filter for units that need to attack
                    if( this.data.needsToAttack && !unit.needsToAttack ) return;
                    // filter for killed units only
                    if( this.data.killedOnly && !unit.killed ) return;
                    // remove killed units except during combat or if we are specifically looking for killed units
                    if( !this.data.needsToAttack && !this.data.killedOnly && unit.killed ) return;
                    // filter not hidden
                    if( this.data.notHidden && unit.hidden ) return;
                    // filter basic units
                    if( this.data.basicOnly && !unit.basic ) return;
                    // filter flipped units
                    if( this.data.flippedOnly && !unit.flipped ) return;
                    // filter flipped units
                    if( this.data.hasProp && !unit[this.data.hasProp] ) return;
                    // filter has attack value
                    if( this.data.hasAttack && !unit.attack.length ) return;
                    // filter for unit types
                    if( this.data.unitTypes && !this.data.unitTypes.includes( unit.type ) ) return;
                    // if none of these filters already put the kibosh on things, then return true
                    return true;
                });
            },


            /**
             * Determines if a given faction should not have its units included in the unit pool
             * depending on the options provided by the prompt data
             *
             * @param faction
             * @returns {boolean}
             */
            isInvalidFaction( faction ){
                // If "enemy units only" then ignore our faction
                if( this.data.enemyOnly && faction.name === this.shared.faction.name ) return true;

                // if "this player's unit only" then ignore enemy factions
                if( this.data.playerOnly && faction.name !== this.shared.faction.name ) return true;

                // if "belongs to a specific player" ignore any faction that's not the named faction
                if( this.data.belongsTo && faction.name !== this.data.belongsTo ) return true;
            },


            isInvalidUnit( unit ){
                    // If we only want enemy units, but this unit is one of ours
                return ( this.data.enemyOnly && unit.faction === this.shared.faction.name )
                    // if We only want our units, but this is an enemy unit
                    || ( this.data.playerOnly && unit.faction !== this.shared.faction.name )
                    // if we only want certain unit types and this one does match
                    || ( this.data.unitTypes && !this.data.unitTypes.includes( unit.type ) );
            },


            /**
             * Responds to clicks on a given unit by ignoring the click, selecting the
             * unit, or deselecting the unit given the circumstances
             *
             * @param unit
             */
            unitClicked( unit ){
                // if this is an invalid unit to select then abort
                if( this.isInvalidUnit( unit ) ) return;

                // if this unit is already selected, deselect it and return
                if( unit.selected ) return this.$set( unit, 'selected', false );

                // otherwise if we don't need to select anymore units
                if( this.needToSelect === 0 ) {
                    // and the number of units we needed to select overall is more than 1 return and do nothing
                    if( this.data.count > 1) return;

                    // but if the number of units we needed to select is exactly one instead of ignoring the click
                    // lets just unselect whatever we had previously had selected and continue so the newly clicked
                    // unit will become the one selected unit
                    this.selected.forEach( unit => this.$set( unit, 'selected', false ) );
                }

                // set the clicked unit to selected
                this.$set( unit, 'selected', true );
            },
        }
    }
</script>


<style>

    .min-prompt-width {
        min-width: 40rem;
    }

</style>

