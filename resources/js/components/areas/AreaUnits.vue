<template>
    <div class="" :class="classes">
        <unit-row :classes="classes" :units="units"></unit-row>
    </div>
</template>


<script>
    export default {

        name: 'area-units',
        props : ['faction', 'area', 'skilled', 'classes'],

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            units(){
                 return this.faction.units.filter( unit => {
                     if( this.skilled ){
                         return _.unitReadyInArea( unit, this.area );
                     }

                     return _.unitNotReadyInArea( unit, this.area );
                 });
            }
        }

    }
</script>


<style>

</style>

