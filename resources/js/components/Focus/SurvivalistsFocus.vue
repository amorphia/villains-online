<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        Enemy Areas With Units :<span class="highlight ml-2">{{ areas }}</span>
    </div>
</template>


<script>
    export default {

        name: 'units-enemy-areas-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            /**
             * Returns the number of units we have killed in enemy areas
             * @returns {number}
             */
            areas(){
                return _.enemyAreasWhereFactionHasUnits(
                    this.faction,
                    this.shared.data.factions,
                    this.shared.data.areas,
                    this.shared.areaLeaders
                ).length;
            },

        }
    }
</script>


<style>

</style>

