<template>
    <div class="width-100 pos-relative z-0 overflow-auto game-display game-display-height">

        <!-- server offline -->
        <div v-if="shared.socket.disconnected" class="pos-absolute top-0 z-5 server-offline">
            <i class="icon-kill"></i>SERVER OFFLINE
        </div>

        <!-- player take action prompt -->
        <transition name="open">
            <component v-if="shared.player.prompt.name" :is="shared.player.prompt.name"></component>
        </transition>

        <!-- core components -->
        <view-combat></view-combat>
        <view-area></view-area>
        <view-player></view-player>
        <view-card></view-card>
        <view-discards></view-discards>
        <game-settings></game-settings>
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
    .game-display-height {
        height: 91vh;
    }
</style>

