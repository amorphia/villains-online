<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title" v-html="message"></div>
                <area-flipper :areas="areas" :index="index" @update="updateArea">

                    <unit-row v-for="(set, name) in units"
                              :units="set"
                              :key="name"
                              :classes="shouldSetOpacity( name )"
                              @unit="selectFaction"></unit-row>

                </area-flipper>

                <div v-if="attackMod !== false" class="prompt-question">Your units get {{ attackMod >= 0 ? '+' : '' }}{{ attackMod }} to their rolls against the {{ faction }}</div>

                <div class="">
                    <button v-if="data.optional" class="button button-empty" @click="resolve( false )">DECLINE</button>
                    <button class="button" :disabled="!faction" @click="resolve( true )">SELECT VICTIM</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-victim',

        data() {
            return {
                shared : App.state,
                index : 0,
                faction : null
            };
        },

        computed : {

            attackMod(){
                if( !this.faction || !this.data.unitAttack ) return false;

                let targetFaction = this.shared.data.factions[ this.faction ];
                let defenseBonus = _.calculateDefenseBonus( this.shared.faction, targetFaction, this.area );
                let factionAttackBonus = this.shared.faction.attackBonus ?? 0;
                let combatAttackBonus = this.data.attackBonus ?? 0;

                return combatAttackBonus + factionAttackBonus - defenseBonus;
            },

            units(){
                let units = {};
                _.forEach( this.shared.data.factions, faction => {
                    if( faction.name === this.data.faction ) return;
                    let factionUnits = _.factionUnitsInArea( faction, this.area.name );
                    if( factionUnits.length ){
                        units[faction.name] = factionUnits;
                    }
                });
                return units;
            },

            message(){
                return this.data.message ? this.shared.filterText( this.data.message ) : 'Choose your victim'
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

            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            selectCurrentFactionUnits(){
                _.forEach( this.units, (units, name) => {
                    units.forEach( unit => this.$set( unit, 'selected', name === this.faction ) );
                });
            },

            selectFaction( unit ){
                if( this.faction === unit.faction ){
                    this.faction = null;
                } else {
                    this.faction = unit.faction;
                }

                this.selectCurrentFactionUnits();
            },

            shouldSetOpacity( faction ){
                if( this.faction && this.faction !== faction ) return 'opacity-7';
            },

            resolve( val ){
                let data = {};

                if( val ){
                    data.area = this.area.name;
                    data.faction = this.faction;
                } else {
                    data.declined = true;
                }

                data = Object.assign( {}, this.data, data );

                this.shared.respond( 'choose-victim', data );
            },

            updateArea( n ){
                if( n === this.index ) return;
                this.area.tokens.forEach( token => this.$set( token, 'selected', false ) );
                this.index = n;
            },

        }
    }
</script>


<style>

    .place-token{
        min-width: 40rem;
    }


</style>

