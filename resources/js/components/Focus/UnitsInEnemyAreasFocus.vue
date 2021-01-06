<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        units in enemy
        <span v-if="Object.keys( focus ).length">
            <span v-for="(count,type) of focus" class="highlight ml-2"><span class="highlight focus-unit-icon" :class="`icon-${ type !== 'champion' ? type : 'flag'}`"></span>{{ count }}</span>
        </span>
        <span v-else class="ml-2 highlight">none</span>
    </div>
</template>


<script>
    export default {

        name: 'units-in-enemy-areas-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.unitTypesInEnemy(
                    this.faction,
                    this.shared.data.factions,
                    this.shared.data.areas,
                    this.shared.areaLeaders
                );
            }
        }
    }
</script>


<style>
    .focus-unit-icon {
        position: relative;
        top: .1em;
    }

</style>

