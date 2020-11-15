<template>
    <player-prompt>
        <div class="min-prompt-width px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title">{{ message }}</div>
                <area-flipper :areas="areas" :index="index" @update="updateArea">

                    <unit-row v-for="(set, name) in units"
                              :units="set"
                              :key="name"
                              @unit="u => unit = u"
                              :selectedUnit="unit"></unit-row>

                </area-flipper>

                <div class="">
                    <button class="button button-empty" @click="resolve( false )">DECLINE</button>
                    <button class="button" :disabled="!unit" @click="resolve( true )">save</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'assassinate-unit',

        data() {
            return {
                shared : App.state,
                index : 0,
                unit : null
            };
        },

        computed : {


            units(){
                return _.enemyUnitsInArea( this.shared.faction, this.area, this.shared.data.factions, { basic : true, notHidden : true } );
            },

            message(){
                return this.data.message ? this.data.message : 'Choose your victim'
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

            updateArea( n ){
                if( n === this.index ) return;
                //this.areaUnits.forEach( unit => this.$set( unit, 'selected', false ) );
                this.index = n;
            },

            resolve( val ){
                let data = {
                    area : this.area.name
                };

                if( val ){
                    data.unit = this.unit.id;
                } else {
                    data.declines = true;
                }

                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'assassinate-unit', data );
            },
        }
    }
</script>
