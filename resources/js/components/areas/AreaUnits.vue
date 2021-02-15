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


                // plants
                if( !this.skilled && this.faction.name === 'plants' && this.faction.plants[this.area] ){
                    for( let i = 0; i < this.faction.plants[this.area]; i++ ){
                        units.push({ type : 'plant', faction : 'plants' });
                    }
                }

                // ninjas
                if( !this.skilled && this.faction.name === 'ninjas' && this.faction.smokeAreas.includes( this.area )){
                    units.push({ type : 'smoke', faction : 'ninjas' });
                }

                // ghosts
                if( !this.skilled && this.faction.name === 'ghosts' ){
                    let areaGhosts = this.faction.ghosts.filter( ghost => ghost.location === this.area );
                    for( let i = 0; i < areaGhosts.length; i++ ){
                        let ghost = areaGhosts[i];
                        ghost.hideFromEnemies = 'ghost';
                        units.push( ghost );
                    }
                }

                return units;
            }
        }

    }
</script>


<style>

</style>

