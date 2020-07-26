<template>
    <div class="message-box">
        <img v-for="card in message.cards"
             class="width-100 message__card pointer"
             @click="shared.card = `/images/cards/${card.file}.jpg`"
             :src="`/images/cards/${card.file}.jpg`">

        <div v-if="message.area" class="center-text width-100">
            <span class="d-block">in the</span>
            <div class="player-hud__target p-2 text-center"
                 :style="`background-image: url(/images/areas/${message.area.name}-slice.jpg)`">
                {{ message.area.name }}
            </div>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'cards-message',
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
        position: relative;
    }

    .message__card {
        border-radius: 9%;
    }
</style>

