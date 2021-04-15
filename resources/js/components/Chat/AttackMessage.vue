<template>
    <div class="message-box">
        <div class="center-text width-100 white">
            <!-- unit name -->
            <span v-if="message.unit" :class="`faction-${message.unit.faction}`">{{ message.unit.name }} </span>

            <!-- rolls text -->
            Rolls {{ message.rolls.length }} {{ message.rolls.length > 1 ? 'dice' : 'die' }} at <span :class="`faction-${message.victim}`">the {{ message.victim}}</span> needing <span class="highlight">{{ message.toHit }}</span>:

            <!-- rolls -->
            <div class="width-100 flex-center flex-wrap my-3">
                <img v-for="roll in message.rolls" class="message__roll" :class="{'saturate-0' : rollMiss( roll ) }" :src="`/images/icons/attack-${roll}.png`">
            </div>

            <!-- hits -->
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
        },
        methods : {
            /**
             * is this roll a miss?
             *
             * @param roll
             * @returns {boolean}
             */
            rollMiss( roll ){
                return roll < this.message.toHit;
            }
        }
    }
</script>

<style>
    .message__roll {
        width: 2.75vw;
    }
</style>

