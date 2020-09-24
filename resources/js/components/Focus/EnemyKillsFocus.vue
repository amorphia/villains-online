<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        <span class="mr-4">skips :<span class="highlight ml-2">{{ skips }}</span> </span> kills in enemy areas :<span class="highlight ml-2">{{ kills }}</span>
    </div>
</template>


<script>
    export default {

        name: 'enemy-kills-focus',

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            kills(){
                return _.factionKillsInEnemy(
                    this.shared.faction,
                    this.shared.data.factions,
                    this.shared.data.areas,
                    this.shared.areaLeaders
                ).length;
            },
            skips(){
                return this.shared.faction.skips.max - this.shared.faction.skips.used;
            }
        }
    }
</script>


<style>

</style>

