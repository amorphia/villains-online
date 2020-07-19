<template>
    <div class="game-core width-100 height-100 d-flex align-stretch pos-relative">
        <game-hud :closed="gameHudClosed" @toggleDrawer="gameHudClosed = !gameHudClosed"></game-hud>
        <game-core :classes="drawerClosed"></game-core>
    </div>
</template>


<script>

    export default {
        name: 'game-container',
        data() {
            return {
                shared : App.state,
                gameHudClosed : false,
            };
        },
        methods : {
            drawerClosed(){
                return gameHudClosed ? 'drawer--closed' : '';
            }
        }

    }
</script>


<style>

</style>

