<template>
    <div :class="classes">
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
            units() {
                // get our standard units
                let units = this.getStandardUnits();

                //  get our plants
                units = this.getPlants( units );

                //  get our memorials
                units = this.getMemorials( units );

                // add smoke
                units = this.getSmoke( units );

                // add booby trap
                units = this.getBoobyTraps( units );

                units = this.getTunnels( units );
                // add ghosts
                //units = this.getGhosts( units );

                return units;
            },
        },
        methods : {

            /**
             * Returns an array of this faction's units in the area
             * @returns {Unit[]}
             */
            getStandardUnits(){
                let options = {};

                if( this.skilled ) options.ready = true; // should we return ready skilled units only?
                else options.notReady = true; // otherwise only return exhausted units

                return this.faction.units.filter( unit => _.unitInArea( unit, this.area, options ));
            },


            /**
             * Add this faction's plants to our units array
             * @returns {Unit[]}
             */
            getPlants( units ){
                // abort conditions
                if ( this.skilled || !this.faction.plants?.[this.area] ) return units;

                // add our plants
                for (let i = 0; i < this.faction.plants[this.area]; i++) {
                    units.push({ type: 'plant', faction: 'plants' });
                }

                return units;
            },

            /**
             * Add this faction's memorials to our units array
             * @returns {Unit[]}
             */
            getMemorials( units ){
                // abort conditions
                if ( this.skilled || !this.faction.memorials?.[this.area] ) return units;

                // add our memorials
                for (let i = 0; i < this.faction.memorials[this.area]; i++) {
                    units.push({ type: 'memorial', faction: 'martyrs' });
                }

                return units;
            },

            /**
             * Add this faction's smoke to our units array
             * @returns {Unit[]}
             */
            getSmoke( units ){
                // abort conditions
                if ( this.skilled || ! this.faction.smokeAreas?.includes( this.area ) ) return units;

                // add smoke
                units.push({type: 'smoke', faction: 'ninjas'});

                return units;
            },

            /**
             * Add this faction's smoke to our units array
             * @returns {Unit[]}
             */
            getBoobyTraps( units ){
                // abort conditions
                if ( this.skilled || ! this.faction.trappedAreas?.includes( this.area ) ) return units;

                let count = this.faction.trappedAreas?.filter( area => area === this.area ).length;

                for(let i = 0; i < count; i++ ){
                    // add booby traps
                    units.push({type: 'booby-trap', faction: 'guerrillas'});
                }


                return units;
            },

            getTunnels( units ){
                // abort conditions
                if ( this.skilled || ! this.faction.tunnels?.includes( this.area ) ) return units;

                // add smoke
                units.push({type: 'tunnel', faction: 'molemen'});

                return units;
            },

            /**
             * Add this faction's ghosts to our units array
             * @returns {Unit[]}
             */
            getGhosts( units ){
                // fail case
                if ( this.skilled || !this.faction.ghostDeploy ) return units;

                // add our ghosts
                let areaGhosts = this.faction.ghosts.filter( ghost => _.unitInArea( ghost, this.area ) )
                    .forEach( ghost => {
                        ghost.hideFromEnemies = 'ghost';
                        units.push( ghost );
                    });

                return units;
            }
        }

    }
</script>

