<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        total kills :<span class="highlight ml-2">{{ kills }}</span>
    </div>
</template>


<script>
    export default {

        name: 'fusion-focus',

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            kills(){
                return _.factionKills( this.shared.faction, this.shared.data.factions ).length;
            }
        }
    }
</script>


<style>

</style>

