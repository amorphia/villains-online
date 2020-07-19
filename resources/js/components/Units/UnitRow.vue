<template>
    <div class="unit-row center-text pb-3" :class="classes">
        <unit-icon v-for="unit in units"
                   :key="unit.id"
                   :unit="unit"
                   :selectedUnit="selectedUnit"
                   :assigningHits="assigningHits"
                   :allSelected="allSelected"
                   @unit="(u, hp) => $emit( 'unit', u, hp )">
        </unit-icon>
    </div>
</template>


<script>
    export default {

        name: 'unit-row',
        props: ['units', 'classes', 'selectedUnit', 'assigningHits', 'allSelected'],
        data() {
            return {
                shared : App.state
            };
        },
        methods : {

        }
    }
</script>


<style>



</style>

