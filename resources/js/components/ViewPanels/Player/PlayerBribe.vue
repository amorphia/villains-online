<template>
    <div class="d-flex">
        <div class="view-player__title width-100 pos-relative">
            <!-- player name -->
            <i v-if="shared.isFirstPlayer( player )" class="first-player icon-key"></i>{{ player.name | startCase }}

            <!-- bribe wrap -->
            <div v-if="canBribe" class="bribe-box pos-absolute top-0 right-0 d-flex align-baseline">
                <!-- reduce bribe -->
                <i :disabled="bribe === 0" @click="bribe--" class="icon-minimize pr-2"></i>

                <!-- bribe display -->
                <img class="icon-image ml-3" src="/images/icons/resource.png">
                <div class="ml-2 current-bribe mr-3">{{ bribe }}</div>

                <!-- increase bribe -->
                <i :disabled="bribe >= shared.faction.resources" @click="bribe++" class="icon-maximize"></i>

                <!-- send bribe -->
                <span :disabled="bribe === 0" class="pointer ml-3" @click="sendBribe">SEND BRIBE</span>
            </div>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'player-bribe',
        props : [ 'player' ],

        data() {
            return {
                shared : App.state,
                bribe : 0,
            };
        },

        computed : {
            /**
             * Can we send a bribe to this player?
             * @returns {boolean|number}
             */
            canBribe(){
                return this.shared.data.allowBribes // does the game allow bribes?
                    && this.shared.player.id !== this.player.id // is this another player?
                    && this.shared.faction.resources; // do we have any resources?
            },
        },

        methods : {
            /**
             * Send a bribe event
             */
            sendBribe(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socketEmit( 'sendBribe', this.faction.name, this.bribe );
                this.bribe = 0;
            },
        }
    }
</script>

