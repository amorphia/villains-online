<template>
    <div class="p-2 pr-0 width-100 height-100 pos-relative z-0">
        <div class="game-map width-100 height-100">
            <area-map v-for="area in shared.data.areas" :area="area" :key="area.name"></area-map>
        </div>
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
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        width: 100%;
        height: 100%;
    /*
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 1fr;
    */
}

</style>

