<template>
    <div class="message-box">
        <img class="width-75" :src="`/images/tokens/capitol-${message.turn}.png`">
    </div>
</template>


<script>
    export default {

        name: 'capitol-token-message',
        props : ['message'],
        data() {
            return {
                shared : App.state
            };
        }
    }
</script>


<style>
    .message-box .player-hud__target {
        height: 1.8rem;
        line-height: 1.4rem;
        font-size: 1.5em;
        color: white;
        margin-top: .2em;
    }
</style>

