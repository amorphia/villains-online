<template>
    <player-prompt classes="">
        <div class="choose-spy overflow-auto px-5">
            <div class="title view-player__title">Choose player to spy on</div>
            <div class="d-flex justify-center">
                <div class="choose-factions__player-container">
                    <div v-if="player.id !== shared.player.id" v-for="player in shared.orderedPlayers()"
                         class="choose-factions__player pull-center d-flex align-stretch"
                         @click="spy = player.faction"
                         :class="{ active : player.faction == spy }">

                        <div class="choose-factions__player-faction width-15 d-flex pr-2">
                            <img class="choose-spy__champion" :src="`/images/factions/${player.faction}/portrait.png`" >
                        </div>

                        <div class="choose-factions__player-name ellipses width-60 p-4">{{ player.name | startCase }}</div>

                        <div class="choose-spy__checkbox width-25 choose-factions__player-faction d-flex align-center justify-center">
                            <i :class="player.faction == spy ? 'icon-checkbox-checked' : 'icon-checkbox-unchecked'"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="width-100 d-flex justify-center">
                <button class="button" :disabled="!spy" @click="saveSpy">SAVE</button>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-spy',

        data() {
            return {
                shared : App.state,
                spy : null,
            };
        },

        methods : {
            saveSpy(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socketEmit( 'saveSpy', this.spy );
            }
        }
    }
</script>


<style>
 .choose-spy__champion{
     width: 100%;
 }

    .choose-spy .icon-checkbox-unchecked {
        color: var(--primary-light-color );
    }

 .choose-spy .icon-checkbox-checked {
     color: var(--highlight-color );
 }
</style>

