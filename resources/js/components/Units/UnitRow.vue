<template>
    <div class="unit-row center-text pb-3" :class="classes">
        <!-- units shown individually in a row -->
        <unit-icon v-for="unit in units"
                   :key="unit.id"
                   :unit="unit"
                   :selectedUnit="selectedUnit"
                   :assigningHits="assigningHits"
                   :hitsToAssign="hitsToAssign"
                   :allSelected="allSelected"
                   :hidePatsies="hidePatsies"
                   :globalEmit="globalEmit"
                   @unit="(u, hp) => $emit( 'unit', u, hp )">
        </unit-icon>
    </div>
</template>


<script>
    export default {

        name: 'unit-row',
        props: [
            'units',
            'classes',
            'selectedUnit',
            'assigningHits',
            'allSelected',
            'hidePatsies',
            'hitsToAssign',
            'globalEmit'
        ],
        data() {
            return {
                shared : App.state
            };
        },
    }
</script>


<style>

    .units-hud__unit .area-map__token-space {
        position: absolute;
        z-index: 3;
        width: 80%;
        left: 52%;
        bottom: 53%;
        transform: translate(-50%, 50%);

    }

    .units-hud__unit .area-map__token-space img {
        outline: none;
        opacity: 1 !important;
    }

</style>

