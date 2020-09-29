<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        areas with most units :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'most-units-areas-focus',

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.areasMostUnits( this.shared.faction, this.shared.data.factions );
            }
        }
    }
</script>


<style>

</style>

