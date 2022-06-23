<template>
    <div class="save-game pos-relative overflow-hidden"
         @click="$emit( 'open', index )">

        <!-- date -->
        <div class="save-game__date">{{ created }}</div>

        <!-- save states -->
        <div class="save-game__saves" :class="{ open : open }" >
            <!-- players -->
            <div class="save-game__players">
            <span class="save-game__player ellipses capitalize mr-2"
                  v-for="player in game.players">
                    {{ player }}
            </span>
            </div>


            <button class="active-game__button button small mt-3 width-100" @click.prevent="loadGame">watch</button>

        </div>
    </div>
</template>


<script>
    const dayjs = require('dayjs');
    var localizedFormat = require('dayjs/plugin/localizedFormat');
    dayjs.extend(localizedFormat);

    export default {

        name: 'active-game',
        props : [ 'game', 'open', 'index' ],
        data() {
            return {
                shared : App.state
            };
        },
        methods : {
            /**
             * Load our game
             */
            loadGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'watchGame', this.game.id );
            },
        },
        computed : {
            created(){
                return dayjs(this.game.created).format("lll");
            }
        }
    }
</script>


<style>
    .active-game__id {
        color: rgba(255,255,255,.75);
        font-size: .7rem;
    }
</style>

