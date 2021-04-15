<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center pb-5">
                <!-- title -->
                <div class="title mb-4">{{ data.message }}</div>

                <!-- units -->
                <div class="py-3" v-for="set in areas">
                    <area-flipper :areas="[shared.data.areas[set.area]]" locked="true" index="0" classes="area-header__units">
                        <unit-row :units="set.units"></unit-row>
                    </area-flipper>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'deploy-action',
        data() {
            return {
                shared : App.state,
            };
        },

        computed : {

            /**
             * Return prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },

            /**
             * Return an array of objects with tallying the areas with units that were shifted
             * @returns {object[]} { area : Area, units : Unit[] }
             */
            areas(){
                // if we have not units, return an empty array
                if( !this.data.units ) return [];

                // if our data "units" property isn't an array, wrap it in an array
                if( !Array.isArray( this.data.units ) ) this.data.units = [ this.data.units ];

                // if we only have one area, return that area and our units
                if( this.data.area ) return [{ area : this.data.area, units : this.data.units } ];

                let areasObj = {}, areas = [];

                // create an object to group our units into areas
                this.data.units.forEach( unit => {
                    if( areasObj[unit.location] ) areasObj[unit.location].push( unit );
                    else areasObj[unit.location] = [ unit ];
                });

                // Create the final results array
                _.forEach( areasObj, (units, area) => areas.push( { area : area, units : units } ) );

                return areas;
            }

        }
    }
</script>

