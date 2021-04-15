<template>
    <player-prompt>
        <div class="min-prompt-width px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title">Free units from webs</div>

                <!-- areas -->
                <area-flipper v-for="(val, key) in areas" :areas="[val.area]" :index="0" :key="key" @areaClicked="areaClicked">
                        <unit-row :units="val.units" :allSelected="selectedAreas.includes( key )"></unit-row>
                </area-flipper>

                <!-- cost -->
                <div v-if="cost > 0" class="prompt-question" v-html="shared.filterText( `Pay xC${cost}x to free these units?` )"></div>

                <!-- submit -->
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

            /**
             * Can we submit?
             * @returns {boolean}
             */
            canSubmit(){
                return _.money( this.shared.faction ) >= this.cost;
            },


            /**
             * Calculate our cost
             * @returns {number}
             */
            cost(){
                return this.selectedAreas.length;
            },


            /**
             * Return areas where we have webbed units with those units
             * @returns {object}
             */
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


            /**
             * Return prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            /**
             * resolve prompt
             */
            resolve(){
                let data = { areas : this.selectedAreas };
                data = { ...this.data, ...data };
                this.shared.respond( 'free-units', data );
            },


            /**
             * Handle an area click
             * @param areaName
             */
            areaClicked( areaName ){
                // if this area is already selected unselect it
                if( this.selectedAreas.includes( areaName ) ){
                    this.selectedAreas = this.selectedAreas.filter( area => area !== areaName );
                    return;
                }

                // otherwise select it
                this.selectedAreas.push( areaName );
            },
        }
    }
</script>

