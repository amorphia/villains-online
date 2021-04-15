<template>
    <div class="message-box">
        <!-- icon -->
        <img class="width-85" :src="`/images/factions/${message.token.faction}/tokens/${message.token.name}.png`">
        <span class="d-block">in the</span>
        <!-- area -->
        <div class="player-hud__target p-2 text-center"
             :style="`background-image: url(/images/areas/${message.token.location}-slice.jpg)`">
                {{ message.token.location }}
        </div>
    </div>
</template>


<script>
    export default {

        name: 'reveal-token-message',
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

