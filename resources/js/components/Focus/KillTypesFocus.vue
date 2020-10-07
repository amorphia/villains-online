<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        <div class="mr-3">types killed :<span class="highlight ml-2">{{ totalTypesKilled }}</span></div>
        <div class="mr-3" title="Moles and Talents Killed">mt :<span class="highlight ml-2">{{ moleTalent }}</span></div>
        <div class="mr-2" title="Goons and Champions Killed">gc :<span class="highlight ml-2">{{ goonChampion }}</span></div>
    </div>
</template>


<script>
    export default {

        name: 'kill-areas-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },

        methods : {
            killTypesCount( types ){
                let killsOfTypes = 0;

                types.forEach( type => {
                    if( this.typesKilled.hasOwnProperty( type ) ) killsOfTypes += this.typesKilled[type];
                });

                return killsOfTypes;
            }
        },

        computed : {

            totalTypesKilled(){
                if( !this.typesKilled ) 0;
                return Object.keys( this.typesKilled ).length;
            },

            moleTalent(){
                return this.killTypesCount( [ 'mole', 'talent' ] );
            },

            goonChampion(){
                return this.killTypesCount( [ 'goon', 'champion' ] );
            },

            typesKilled(){
                return _.factionTypesKilled( this.faction, this.shared.data.factions );
            }
        }
    }
</script>


<style>

</style>

