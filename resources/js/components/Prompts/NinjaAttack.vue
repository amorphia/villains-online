<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title" v-html="message"></div>
                <area-flipper  :areas="[area]" index="0">
                    <unit-row :units="areaUnits"></unit-row>

                    <div>
                        <unit-row v-for="(set, name) in enemyUnits"
                                  :units="set"
                                  :key="name"
                        ></unit-row>
                    </div>
                </area-flipper>

                <div class="">
                    <button class="button button-empty" @click="resolve( false )">ATTACK WITH UNITS</button>
                    <button class="button" @click="resolve( true )">PERFORM NINJA ATTACK</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'ninja-attack',
        data() {
            return {
                shared : App.state,
            };
        },

        computed : {

            enemyUnits(){
                return _.enemyUnitsInArea( this.shared.faction, this.area, this.shared.data.factions );
            },

            message(){
                return this.shared.filterText( 'Attack with your units, or attack of xA4x against target basic unit?' )
            },

            area(){
                return this.shared.data.areas[ this.data.area ];
            },

            areaUnits(){
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, this.area ) );
            },

            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {
            resolve( action ){
                let data = { ninjaAttack : action };
                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'ninja-attack', data );
            },
        }
    }
</script>


<style>
</style>

