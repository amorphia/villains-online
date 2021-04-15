<template>
    <hud-popout :open="open" nohandle="true" classes="units-hud" @close="$emit( 'close' )">

        <horizontal-scroll classes="units-hud__tokens-container p-4 center-text d-flex justify-center">
            <unit-set :units="reserves" :title="`Reserves [${reserves.length}]`" classes="border"></unit-set>
            <unit-set :units="deployed" :title="`Deployed [${deployed.length}]`" classes="border"></unit-set>
            <unit-set :units="killed" :title="`Killed [${killed.length}]`" classes="border"></unit-set>
        </horizontal-scroll>

    </hud-popout>
</template>


<script>
    export default {

        name: 'units-hud',
        props: ['open'],
        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            /**
             * Return an array of our units in our reserves
             * @returns {Unit[]}
             */
            reserves(){
                return this.shared.faction.units.filter( unit => !unit.location );
            },


            /**
             * Return an array of our units in play
             * @returns {Unit[]}
             */
            deployed(){
                return this.shared.faction.units.filter( unit => unit.location && !unit.killed );
            },


            /**
             * Return an array of our units that have been killed
             * @returns {Unit[]}
             */
            killed(){
                return this.shared.faction.units.filter( unit => unit.location && unit.killed  );
            }
        },
    }
</script>


