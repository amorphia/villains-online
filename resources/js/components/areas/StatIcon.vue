<template>
    <i
       @click.right.prevent.stop="() => {
           $refs.tooltip.open();
           shared.event.emit( 'areaClicked', area );
       }"
       class="stat-icon tooltip"
       :class="`icon-${stat.name} faction-${stat.owner}`"
       :title="`${stat.title}: ${stat.description} - [${stat.owner}]`">
            <tool-tip direction="top" :title="stat.title" ref="tooltip">
                <div class="center-text" :class="`faction-${stat.owner}`">({{ stat.owner }})</div>
                <div>{{ stat.description }}</div>
            </tool-tip>
    </i>
</template>


<script>
    export default {
        name: "stat-icon",
        props: ['stat', 'area'],

        data() {
            return {
                shared : App.state,
            };
        },

        methods : {

        },

        computed : {}
    }
</script>


<style>


</style>

