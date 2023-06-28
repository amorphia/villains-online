<template>
    <div class="game-map p-2 pr-0 game-display-height pos-relative z-0">
            <area-map v-for="area in shared.data.allAreas" :areaName="area" :key="area"></area-map>
    </div>
</template>


<script>
    export default {
        name: 'game-map',
        data() {
            return {
                shared : App.state
            };
        }
    }
</script>


<style>
    .game-map {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        position: relative;
}
</style>

