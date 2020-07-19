<template>
    <div class="message-box">
        <div class="center-text width-100 white">
            <span v-if="message.unit" :class="`faction-${message.unit.faction}`">{{ message.unit.name }} </span>
            Rolls {{ message.rolls.length }} {{ message.rolls.length > 1 ? 'dice' : 'die' }} at <span :class="`faction-${message.victim}`">the {{ message.victim}}</span> needing <span class="highlight">{{ message.toHit }}</span>:
            <div class="width-100 flex-center flex-wrap my-3">
                <img v-for="roll in message.rolls" class="message__roll" :src="`/images/icons/attack-${roll}.png`">
            </div>
            scoring <span class="highlight">{{ message.hits }}</span> {{ message.hits === 1 ? 'hit' : 'hits' }}
        </div>
    </div>
</template>


<script>
    export default {

        name: 'attack-message',
        props : ['message'],
        data() {
            return {
                shared : App.state
            };
        }
    }
</script>


<style>
    .message__roll {
        width: 2.75vw;
    }
</style>

