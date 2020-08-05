<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center pb-5">

                <div class="title mb-4">{{ data.message }}</div>

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

        methods : {

        },

        computed : {

            data(){
                return this.shared.player.prompt.data;
            },

            areas(){
                if( !this.data.units ) return [];
                if( !Array.isArray( this.data.units ) ) this.data.units = [ this.data.units ];

                let areasObj = {}, areas = [];

                this.data.units.forEach( unit => {
                    if( areasObj[unit.location] ) areasObj[unit.location].push( unit );
                    else areasObj[unit.location] = [ unit ];
                });

                _.forEach( areasObj, (units, area) => areas.push( { area : area, units : units } ) );

                return areas;
            }

        }
    }
</script>


<style>



</style>

