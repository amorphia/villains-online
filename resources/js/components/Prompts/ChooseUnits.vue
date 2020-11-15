<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title" v-html="shared.filterText( message )"></div>
                <area-flipper v-if="areas.length" :areas="areas" :index="index" @update="updateArea">
                    <div v-if="!data.hideMax" class="toggle area-map__toggle top-0 left-0">Selected: {{ selected.length }} / {{ data.count }}</div>

                    <unit-row :units="areaUnits" @unit="unitClicked"></unit-row>

                    <div v-if="data.showEnemyUnits">
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

                <div v-if="data.showReserves" class="mt-3">
                    <div class="prompt-question center-text">The Parasites can infect these unit types</div>
                    <unit-row :units="reserves"></unit-row>
                </div>

                <div v-if="data.gainsSeeking" class="prompt-question" v-html="shared.filterText( `This attack gains <b>seeking</b> xSEEKx` )"></div>

                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to choose these units?` )"></div>

                <div class="">
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
                index : 0,
            };
        },

        computed : {

            cost(){
                let cost = 0;

                if( this.data.policePayoff ) cost += _.policePayoffs( this.shared.faction, this.shared.data.areas[this.data.policePayoff], this.selected ) * this.selected.length;

                if( this.data.vines ) cost += this.selected.length * this.data.vines;

                if( this.data.materialize ) cost += this.areaCost;

                if( this.data.payCost ) cost += this.selected.reduce( ( cost, unit ) => cost += unit.cost, 0 );

                return cost;
            },

            areaCost(){
                if( !this.data.materialize ) return 0;

                let areas = {};
                this.selected.forEach( unit => {
                   areas[ unit.location ] = true;
                });

                areas = Object.keys( areas ).length;

                return areas > 2 ? 1 : 0;
            },

            canSubmit(){
                if( this.cost <= _.money( this.shared.faction )
                    && (
                        this.needToSelect === 0
                        || ( this.data.optionalMax && this.selected.length > 0 )
                    )
                ) return true;
            },

            enemyUnits(){
                if( !this.data.showEnemyUnits ) return [];
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

            reserves(){
                let reserves = {};
                if( !this.data.showReserves ) return [];

                this.shared.data.factions[this.data.showReserves].units.forEach( unit => {
                    if( unit.basic && _.unitInReserves( unit ) && !reserves[unit.type] ) reserves[unit.type] = unit;
                });

                return Object.values( reserves );
            },

            message(){
                if( this.data.message ) return this.data.message;
                return `Choose ${this.data.count} ${this.data.playerOnly ? 'of your ' : ''}${this.data.revealedOnly ? 'revealed ' : '' }${ this.data.unrevealedOnly ? 'unrevealed ' : '' }${ this.data.enemyOnly ? 'enemy ' : '' }unit${ this.data.count > 1 ? 's' : '' }`;
            },

            area(){
                return this.shared.data.areas[ this.currentArea ];
            },

            currentArea(){
                return this.data.areas[this.index];
            },

            areas(){
                let areas = [];
                this.data.areas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },

            needToSelect(){
                if( !this.data.count ) return this.selected.length > 0 ? 0 : 1;

                return this.data.count - this.selected.length;
            },

            areaUnits(){
                return this.unitsPool.filter( unit => unit.location === this.area.name );
            },

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

            webbed(){
                let units = [];
                if( !this.data.needsToAttack || !this.shared.data.factions['spiders'] ) return units;

                units = this.shared.data.factions['spiders'].webs.filter( unit =>
                        unit.faction === this.shared.faction.name
                        && unit.location === this.area.name
                        && unit.needsToAttack
                    );

                return units;
            },

            selected(){
                return this.unitsPool.filter( unit => unit.selected );
            },

            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            resolve( action ){
                let data = {};

                if( action ){
                    data.units = _.map( this.selected, 'id' );
                    data.cost = this.cost;
                    data.areaCost = this.areaCost
                } else {
                    data.decline = true;
                }

                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'choose-units', data );
            },


            updateArea( n ){
                if( n === this.index ) return;
                //this.areaUnits.forEach( unit => this.$set( unit, 'selected', false ) );
                this.index = n;
            },


            getStartingFactionUnits( faction ){
                // let's assume we are starting with the faction's unit array
                let factionUnits = faction.units;

                // but if we are looking for "ghosts only" then let's swap out to the ghosts array
                if( this.data.ghostOnly )  factionUnits = faction.ghosts ? faction.ghosts : [];

                // We need to add webbed units to the collection if we are looking for units that need to attack
                // since units can get moved into the webbed array from their owner's unit array mid-combat
                // but those webbed units may still need to be able to retaliate during combat
                if( this.data.needsToAttack && this.shared.data.factions['spiders'] ){
                    factionUnits = _.concat( factionUnits, this.webbed );
                }

                return factionUnits;
            },


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
                    // filter has attack value
                    if( this.data.hasAttack && !unit.attack.length ) return;
                    // filter for unit types
                    if( this.data.unitTypes && !this.data.unitTypes.includes( unit.type ) ) return;
                    // if none of these filters already put the kibosh on things, then return true
                    return true;
                });
            },


            isInvalidFaction( faction ){
                // If "enemy units only" then ignore our faction
                if( this.data.enemyOnly && faction.name === this.shared.faction.name ) return true;

                // if "this player's unit only" then ignore enemy factions
                if( this.data.playerOnly && faction.name !== this.shared.faction.name ) return true;

                // if "belongs to a specific player" ignore any faction that's not the named faction
                if( this.data.belongsTo && faction.name !== this.data.belongsTo ) return true;
            },


            unitClicked( unit ){

                if( ( this.data.enemyOnly && unit.faction === this.shared.faction.name )
                    || ( this.data.playerOnly && unit.faction !== this.shared.faction.name )
                    || ( this.data.unitTypes && !this.data.unitTypes.includes( unit.type ) )
                ) {
                    return;
                }

                if( unit.selected ){
                    this.$set( unit, 'selected', false );
                } else {
                    if( this.needToSelect === 0 ) {
                        if( this.data.count > 1) {
                            return;
                        }
                        this.selected.forEach( unit => this.$set( unit, 'selected', false ) );
                    }
                    this.$set( unit, 'selected', true );
                }
            },
        }
    }
</script>


<style>

    .place-token{
        min-width: 40rem;
    }


</style>

