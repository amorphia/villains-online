<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        <span class="mr-4">ambushes :<span class="highlight ml-2">{{ ambushes }}</span> </span> kills in enemy areas :<span class="highlight ml-2">{{ kills }}</span>
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
            kills(){
                return _.factionKillsInEnemy(
                    this.faction,
                    this.shared.data.factions,
                    this.shared.data.areas,
                    this.shared.areaLeaders
                ).length;
            },
            ambushes(){
                return this.faction.ambushes.max - this.faction.ambushes.used;
            }
        }
    }
</script>


<style>

</style>

