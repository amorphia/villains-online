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
                let units = this.faction.units.filter( unit => {
                     if( this.skilled ){
                         return _.unitReadyInArea( unit, this.area );
                     }

                     return _.unitNotReadyInArea( unit, this.area );
                 });


                if( !this.skilled && this.faction.name === 'plants' ){
                    for( let i = 0; i < this.shared.data.areas[this.area].plants.length; i++ ){
                        units.push({ type : 'plant', faction : 'plants' });
                    }
                }

                return units;
            }
        }

    }
</script>


<style>

</style>

