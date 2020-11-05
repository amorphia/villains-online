<template>
    <div class="game-map p-2 pr-0 game-display-height pos-relative z-0">
            <area-map v-for="area in shared.data.areas" :area="area" :key="area.name"></area-map>
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

    /*
    .game-map:after {
        content: "";
        background-image: url(/images/tracks.png);
        background-position: center;
        background-size: cover;
        position: absolute;
        z-index: -1;
        width: 100%;
        height: 100%;
        opacity: .6;
    }
*/

</style>

