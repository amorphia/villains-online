<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title">{{ message }}</div>
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
                if( ! (this.data.policePayoff || this.data.payCost) ) return 0;

                if( this.data.policePayoff ) return _.policePayoffs( this.shared.faction, this.shared.data.areas[this.data.policePayoff], this.selected ) * this.selected.length;

                if( this.data.payCost ) return this.selected.reduce( ( cost, unit ) => cost += unit.cost, 0 );

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
                return this.data.count - this.selected.length;
            },

            areaUnits(){
                let units = [];

                _.forEach( this.shared.data.factions, faction => {

                    if( this.data.enemyOnly && faction.name === this.shared.faction.name ) return;
                    if( this.data.playerOnly && faction.name !== this.shared.faction.name ) return;
                    if( this.data.belongsTo && faction.name !== this.data.belongsTo ) return;

                    units = _.concat( units, faction.units.filter( unit => {
                        if( this.data.needsToAttack ) {
                            if ( unit.location !== this.area.name || !unit.needsToAttack ) return;
                        } else if( this.data.killedOnly ) {
                            if( unit.location !== this.area.name || !unit.killed ) return;
                        } else {
                            if( !_.unitInArea( unit, this.area ) ) return;
                        }

                        if( this.data.notHidden && unit.hidden ) return;
                        if( this.data.basicOnly && !unit.basic ) return;
                        if( this.data.flippedOnly && !unit.flipped ) return;
                        if( this.data.hasAttack && !unit.attack.length ) return;
                        if( this.data.unitTypes && !this.data.unitTypes.includes( unit.type ) ) return;

                        return true;
                    }));
                });

                return units;
            },

            unitsPool(){
                // belongs to current player
                if( this.data.playerOnly ) return this.shared.faction.units;

                // belongs to specific player
                if( this.data.belongsTo ) return this.shared.data.factions[ this.data.belongsTo ].units;

                // multiple players
                let units = [];
                _.forEach( this.shared.data.factions, faction => {
                    // enemy only
                    if( this.data.enemyOnly && faction.name === this.shared.faction.name ) return;
                    units = _.concat( units, faction.units );
                });
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

