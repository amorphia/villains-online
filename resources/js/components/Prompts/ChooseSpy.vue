<template>
    <player-prompt classes="">
        <div class="choose-spy overflow-auto px-5">

            <!-- title -->
            <div class="title view-player__title">Choose player to spy on</div>

            <div class="d-flex justify-center">
                <div class="choose-factions__player-container">

                    <!-- faction choices -->
                    <div v-if="player.id !== shared.player.id" v-for="player in shared.orderedPlayers()"
                         class="choose-factions__player pull-center d-flex align-stretch"
                         @click="spy = player.faction"
                         :class="{ active : player.faction == spy }">

                        <div class="choose-factions__player-faction width-15 d-flex pr-2">
                            <img class="choose-spy__champion" :src="`/images/factions/${player.faction}/icon.jpg`" >
                        </div>

                        <div class="choose-factions__player-name ellipses width-60 p-4">{{ player.name | startCase }}</div>

                        <div class="choose-spy__checkbox width-25 choose-factions__player-faction d-flex align-center justify-center">
                            <i :class="player.faction == spy ? 'icon-checkbox-checked' : 'icon-checkbox-unchecked'"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- submit button -->
            <div class="width-100 d-flex justify-center">
                <button class="button" :disabled="!spy" @click="resolve">{{ buttonMessage }}</button>
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

        computed : {
            /**
             * Return button message
             * @returns {string}
             */
            buttonMessage(){
                return this.spy ? `spy on the ${this.spy}` : "choose faction";
            }
        },

        methods : {
            /**
             * Resolve this prompt
             */
            resolve(){
                let data = { faction : this.spy };
                data = { ...this.data, ...data };
                this.shared.respond( 'choose-spy', data );
            },
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

