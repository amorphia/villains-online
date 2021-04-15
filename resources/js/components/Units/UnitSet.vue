<template>
    <div v-if="units.length" class="p-3 pos-relative unit-set-block" :class="classes" :data-title="title">
        <!-- units grouped by count -->
        <div class="units-hud__unit d-inline-block pos-relative"
             v-for="(count, type) in shared.groupByCount( units, 'type' )"
             @click="$emit( 'unitClicked', type )"
             :data-count="count">
                <!-- image -->
                <img class="unit-hud__unit-image" :src="`/images/factions/${units[0].faction}/units/${type}.png`">
        </div>
    </div>
</template>



<script>
    export default {

        name: 'unit-set',
        props: [ 'units', 'title', 'grouping', 'noBorder', 'classes' ],
        data() {
            return {
                shared : App.state
            };
        }
    }
</script>


<style>
    .units-hud__unit {
        padding: .5rem;
        width: 6vw;
        height: 6vw;
    }

    .unit-set-block.border {
        border: 1px solid var(--highlight-color);
        margin: 0 .25em;
    }

    .unit-set-block.border[data-title]:after {
        content: attr(data-title);
        position: absolute;
        left: 50%;
        top: 0;
        color: var(--highlight-color);
        font-size: .8em;
        background-color: black;
        transform: translate(-50%, -50%);
        height: 1.5em;
        text-transform: uppercase;
        letter-spacing: 2px;
        justify-content: center;
        align-items: center;
        box-shadow: 0 0 5px rgba(0,0,0,.5);
        padding: 0 .5rem;
        z-index: 3;
    }

</style>

