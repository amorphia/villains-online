<template>
    <div class="width-100 grow-1 pos-relative z-0">
        <component v-if="shared.player.prompt.name" :is="shared.player.prompt.name"></component>
        <view-combat></view-combat>
        <view-area></view-area>
        <view-player></view-player>
        <game-map></game-map>
    </div>
</template>


<script>
    export default {

        name: 'game-display',
        data() {
            return {
                shared : App.state
            };
        }
    }
</script>


<style>

</style>

