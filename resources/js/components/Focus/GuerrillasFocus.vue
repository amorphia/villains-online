<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        <span class="mr-4">traps :<span class="highlight ml-2">{{ traps }}</span> </span>
        <span class="mr-4">ambushes :<span class="highlight ml-2">{{ ambushes }}</span> </span>
        kills :<span class="highlight ml-2">{{ kills }}</span>
    </div>
</template>


<script>
    export default {

        name: 'enemy-kills-focus',
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
            kills(){
                return _.factionKillsInEnemy(
                    this.faction,
                    this.shared.data.factions,
                    this.shared.data.areas,
                    this.shared.areaLeaders
                ).length;
            },

            traps(){
                return this.faction.maxTraps - this.faction.trappedAreas.length;
            },

            /**
             * Returns the number of ambushes we have left this turn
             * @returns {number}
             */
            ambushes(){
                return this.faction.ambushes.max - this.faction.ambushes.used;
            }
        }
    }
</script>


<style>

</style>

