<template>
    <div class="game-hud pos-relative drawer__aside">
        <!-- handle -->
        <adjust-handle direction="right" max="600" min="125"></adjust-handle>

        <div class="width-100 height-100 flex-column d-flex hud-ui">
            <!-- UI -->

            <!-- GAME STATS -->
            <div class="game-turn p-3 grow-0 shrink-0">
                <div class="game-hud__turns width-100 d-flex justify-center align-center">
                    <i v-if="shared?.player?.isSpectator" style="color:gray" title="Toggle Plans View" :class="togglePlans ? 'icon-toggle_on plan-toggle-on' : 'icon-toggle_off'" @click="togglePlansState"></i>
                    <span class="px-2">turn</span>
                    <div v-for="n in 4" class="turn-count__number" :class="turnNumClasses( n )"></div>
                </div>
                <div class="game-phase center-text highlight lowercase">{{ shared.data.phase | startCase }}</div>
            </div>

            <!-- PLAYER STATS -->
            <div v-if="!togglePlans" class="player-panel grow-1 shrink-1 width-100 overflow-auto">
                <player-hud v-for="player in shared.orderedPlayers()"
                    :player="player"
                    :key="player.id"
                />

                <share-image />
            </div>

            <!-- PLANS -->
            <div v-if="togglePlans && !shared?.player?.isSpectator" class="player-panel grow-1 shrink-1 width-100 overflow-auto">
                <player-hud
                    :player="activePlayer"
                    :key="activePlayer.id"
                    :minimal="true"
                />

                <div v-if="viewingPlayerPlanNumbers">
                    <div v-for="num in viewingPlayerPlanNumbers" class="game-hud-plan-wrap">
                        <img  class="game-hud-plan-image" :src="`/images/factions/${viewingPlayer?.name}/plans/${num}.jpg`">
                    </div>
                </div>

                <share-image />
            </div>


            <!-- CONTROLS -->
            <div class="control-panel p-3 grow-0 shrink-0 d-flex align-stretch highlight flex-wrap">
                <turn-timer />


                <!-- SOUND CONTROL -->
                <game-sound></game-sound>

                <!-- DECK AND DISCARDS -->
                <div class="d-inline stat-icon highlight pointer deck-icon"
                    @click="shared.viewDiscard = !shared.viewDiscard"
                     title="view discard pile">
                    <i class='icon-card'></i>
                    <span class="deck-count">{{ shared.data.deckCount }}</span>
                </div>

                <!-- GAME CHEAT SHEETS BUTTON -->
                <div class="d-inline stat-icon highlight pointer" @click="shared.openCheatSheets = !shared.openCheatSheets">
                    <i class='icon-ask' title="view player aid cards"></i>
                </div>

                <!-- GAME OPTIONS BUTTON -->
                <div class="d-inline stat-icon highlight pointer" @click="shared.openSettings = !shared.openSettings">
                    <i class='icon-plans' title="open game settings"></i>
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
                openSettings : false,
                togglePlans : false,
            };
        },
        created(){
            // check our cookies to see any previous hud view setting
            if( localStorage.getItem("plansUI") === 'true' ){
                this.togglePlans = true;
            }
        },

        methods : {
            togglePlansState(){
                this.togglePlans = !this.togglePlans;
                localStorage.setItem("plansUI", JSON.stringify( this.togglePlans ));
            },

            /**
             * Save our game
             */
            saveGame(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'saveGame', this.shared.data.id );
            },


            /**
             * Returns the classes for our turn number
             * @param index
             * @returns {string}
             */
            turnNumClasses( index ){
                let output = 'icon-num-' + index;
                if( this.shared.data.turn === index ) output += " active";
                return output;
            },
        },

        computed: {
            activePlayer(){
                if(this.shared.player?.isSpectator) return null;

                let activeIndex = this.shared?.data?.activePlayerIndex;
                return this.shared.orderedPlayers()[activeIndex];
            },

            viewingPlayer(){
                return this.shared?.faction || null;
            },

            viewingPlayerPlanNumbers(){
                if(this.shared.player?.isSpectator) return null;

                let planNumbers = [];
                this.shared.faction?.plans?.current?.forEach(plan => {
                    planNumbers.push(plan.num);                    
                });

                return planNumbers;
            }
        }
    }
</script>


<style>
    .game-hud-plan-image {
        transform: scale(115%);
        width: 100%;
    }

    .game-hud-plan-wrap {
        border-radius: 1em;
        overflow: hidden;
        width: 100%; 
        margin-bottom: 5px;
    }

    .plan-toggle-on {
        color:var(--primary-light-color) !important;
    }

    .deck-count {
        font-family: var(--primary-font);
        position: relative;
        top: .05em;
        margin-left: .2em;
        color: #ffffff94;
    }

    .stat-icon.deck-icon {
        font-size: 1.2em;
    }

    .stat-icon.save-icon {
        font-size: .95em;
    }

    .rules-link i {
        font-size: .9em;
    }

    .control-panel {
        background-color: rgba(0,0,0,.25);
    }

    .control-panel .stat-icon {
        height: unset;
        width: unset;
        flex-grow: 1;
    }

    .player-panel {
        max-height: 90%;
        scrollbar-width: thin;
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
</style>

