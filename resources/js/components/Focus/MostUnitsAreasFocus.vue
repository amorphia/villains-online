<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        areas with most units :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'most-units-areas-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.areasMostUnits( this.faction, this.shared.data.factions ).length;
            }
        }
    }
</script>


<style>

</style>

