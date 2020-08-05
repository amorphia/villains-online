<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        areas with kills :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'kill-areas-focus',

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.areasWithFactionKills( this.shared.faction, this.shared.data.factions ).length;
            }
        }
    }
</script>


<style>

</style>

