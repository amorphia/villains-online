<template>
    <div class="game-core width-100 height-100 d-flex align-stretch pos-relative">
        <!-- game hud -->
        <game-hud></game-hud>

        <!-- game core -->
        <game-core></game-core>
    </div>
</template>


<script>
    export default {
        name: 'game-container',
        data() {
            return {
                shared : App.state,
            };
        },
    }
</script>


