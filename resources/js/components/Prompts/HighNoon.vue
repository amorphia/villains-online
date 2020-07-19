<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-2">
            <div class="width-100 d-flex justify-center flex-column align-center">


                <div class="title mb-4">Choose a unit from enemy reinforcements</div>
                <div class="mt-3 pb-4">
                    <faction-flipper
                        :factions="enemies"
                        :index="index"
                        classes=""
                        @update="update => index = update">

                        <div v-for="unit in enemyUnits"
                             class="units-hud__unit d-inline-block pos-relative"
                             @click="selectUnit( unit )"
                        >

                            <img
                                class="unit-hud__unit-image"
                                :class="{ripple : unit.selected}"
                                @click="unit.selected = true"
                                :src="`/images/factions/${unit.faction}/units/${unit.type}${unit.flipped ? '-flipped' : ''}.png`">
                        </div>
                    </faction-flipper>

                </div>
                <area-flipper :areas="[area]" :index="0" classes="area-header__units">
                    <div class="toggle area-map__toggle top-0 right-0" @click.stop="shared.event.emit('viewArea', area )"><i class="icon-zoom_in"></i></div>
                    <div class="popout-hud__block p-3 pos-relative"
                         v-for="(units, location) in groupBy( selected, 'faction' )">

                        <div v-for="unit in units" class="units-hud__unit d-inline-block pos-relative">
                            <img
                                class="unit-hud__unit-image"
                                @click="unit.selected = false"
                                :src="`/images/factions/${unit.faction}/units/${unit.type}${unit.flipped ? '-flipped' : ''}.png`">
                        </div>
                    </div>
                </area-flipper>

                <div class="flex-center">
                    <button class="button"
                            @click="resolve( true )"
                            :disabled="!selected.length">save</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'high-noon',

        data() {
            return {
                shared : App.state,
                index : 0,
            };
        },

        methods : {
            resolve( option ){
                let data = {};
                data.units = _.map( this.selected, 'id' );
                data = Object.assign( {}, this.data, data );

                this.shared.respond( 'high-noon', data );
            },

            selectUnit( unit ){

                this.enemyUnits.forEach( unit => unit.selected = false );
                this.$set( unit, 'selected', true );
            },

            groupBy( array, prop ){
                return _.groupBy( array, prop );
            },
        },

        computed : {

            enemies(){
                let enemies = [];
                this.data.enemies.forEach( enemy => {
                    enemies.push( this.shared.data.factions[enemy] )
                });
                return enemies;
            },

            enemyUnits(){
                let units = [];
                this.data.types.forEach( type => {
                    let unit = _.find( this.enemy.units, unit => unit.type === type && !unit.location );
                    if( unit ) units.push( unit );
                });
                return units;
            },

            enemy(){
                return this.shared.data.factions[ this.data.enemies[this.index] ];
            },

            selected(){
                if( !this.enemySelected ) return [];

                return [
                    this.ourSelected,
                    this.enemySelected
                ];
            },

            enemySelected(){
                return _.find( this.enemy.units, unit => unit.selected );
            },

            ourSelected(){
                if( this.enemySelected ){
                    return _.find( this.shared.faction.units, unit => !unit.location && unit.type === this.enemySelected.type );
                }
            },

            data(){
                return this.shared.player.prompt.data;
            },

            area(){
                return this.shared.data.areas[this.data.area];
            },

        }
    }
</script>


<style>

</style>

