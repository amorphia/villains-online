<template>
    <div class="game-hud pos-relative drawer__aside">
        <adjust-handle direction="right" max="600" min="125"></adjust-handle>
        <div class="width-100 height-100  flex-column d-flex">
            <!-- UI -->

            <!-- GAME STATS -->
            <div class="game-turn p-3 grow-0 shrink-0">
                <div class="game-hud__turns width-100 d-flex justify-center">
                    <span class="px-2">turn</span>
                    <div v-for="n in 4" class="turn-count__number" :class="turnNumClasses( n )"></div>
                </div>
                <div class="game-phase center-text highlight lowercase">{{ shared.data.phase | startCase }}</div>
            </div>


            <!-- PLAYER STATS -->
            <div class="player-panel grow-1 shrink-1 width-100 overflow-auto">
                <player-hud v-for="player in shared.orderedPlayers()"
                            :player="player"
                            :key="player.id"></player-hud>
            </div>

            <!-- CONTROLS -->
            <div class="control-panel p-3 grow-0 shrink-0 d-flex align-stretch highlight flex-wrap">
                <game-sound></game-sound>
                <div class="d-inline stat-icon highlight pointer"
                    @click="shared.viewDiscard = !shared.viewDiscard"
                     title="view discard pile">
                    <i class='icon-delete'></i>
                </div>
                <div v-if="shared.admin" class="d-inline stat-icon highlight pointer" @click="saveGame">
                    <i class='icon-save' ></i>
                </div>
                <div class="align-center rules-link">
                    <a href="https://www.docdroid.net/BmzN8Dy/villains-v310-pdf" target="_blank">rules<i class="icon-launch"></i></a>
                </div>

                <div class="width-100">
                    <end-game><div class="pointer conclude">conclude game</div></end-game>
                </div>

            </div>
        </div>

    </div>
</template>


<script>
    export default {
        name: 'game-hud',
        data() {
            return {
                shared : App.state,
            };
        },


        methods : {

            saveGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'saveGame', this.shared.data.id );
            },

            turnNumClasses( n ){
                let output = 'icon-num-' + n;
                if( this.shared.data.turn >= n ){
                    output += " active";
                }
                return output;
            }
        }
    }
</script>


<style>

    .conclude {
        padding: .2em;
        opacity: .6;
    }

    .rules-link {
        padding: .1rem .5rem;
        background-color: rgba(0,0,0,.8);
        margin-left: .15rem;
        display: inline-flex;
    }

    .rules-link i {
        font-size: .9em;
    }

    .control-panel {
        background-color: rgba(0,0,0,.25);
    }

    .player-panel {
        max-height: 90%;
    }

    .game-hud {
        width: 12vw;
        background-image: url('/images/background-blurred.jpg');
        background-size: auto 100%;
        background-position: left;
        box-shadow: 0px 0px 6px rgba(0,0,0,.5);
        font-family: var(--accent-font);
        font-size: 1rem;
        user-select: none;
        z-index: 1;
    }

    .drawer__toggle {
        right: 0;
        top: 0;
        transform: translateX(100%);
        background-color: rgba(0,0,0,.3);
        color: var(--highlight-color);
    }

    .drawer__toggle.closed {
        color: var(--primary-light-color);
    }

    .turn-count__number {
        color : var(--primary-light-color);
        font-size: 1.3rem;
    }

    .turn-count__number.active {
        color: var(--highlight-color);
    }

    .game-turn {
        background-color: rgba(0,0,0,.25);
        margin-bottom: .5rem;
    }
    .game-hud__title {

    }
</style>

