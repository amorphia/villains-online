<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title">Free units from webs</div>

                <area-flipper v-for="(val, key) in areas" :areas="[val.area]" :index="0" :key="key" @areaClicked="areaClicked">
                        <unit-row :units="val.units" :allSelected="selectedAreas.includes( key )"></unit-row>
                </area-flipper>

                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to free these units?` )"></div>

                <div class="">
                    <button class="button" :disabled="!canSubmit" @click="resolve">Save Choices</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'free-units',
        data() {
            return {
                shared : App.state,
                selectedAreas : []
            };
        },

        computed : {

            canSubmit(){
                return _.money( this.shared.faction ) >= this.cost;
            },

            cost(){
                return this.selectedAreas.length;
            },

            areas(){
                let areas = {};
                let webbed = _.webbedUnits( this.shared.data.factions['spiders'], { faction : this.shared.faction.name } );
                webbed.forEach( unit => {
                    if( areas[unit.location] ) areas[unit.location].units.push( unit );
                    else areas[unit.location] = {
                        area : this.shared.data.areas[unit.location],
                        units : [unit]
                    };
                });
                return areas;
            },

            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            resolve(){
                let data = {};
                data.areas = this.selectedAreas;
                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'free-units', data );
            },

            areaClicked( areaName ){
                if( this.selectedAreas.includes( areaName ) ) this.selectedAreas = this.selectedAreas.filter( area => area !== areaName );
                else this.selectedAreas.push( areaName );
            },

        }
    }
</script>


<style>

    .place-token{
        min-width: 40rem;
    }


</style>

