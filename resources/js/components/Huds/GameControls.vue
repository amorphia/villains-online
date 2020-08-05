<template>
    <div class="game-controls width-100 pos-relative no-select">
        <div class="popouts">
            <cards-hud :open="popout === 'cards'" @close="popout = null"></cards-hud>
            <units-hud :open="popout === 'units'" @close="popout = null"></units-hud>
            <tokens-hud :open="popout === 'tokens'" @close="popout = null"></tokens-hud>
            <plans-hud :open="popout === 'plans'" @close="popout = null"></plans-hud>
            <score-hud :open="popout === 'score'" @close="popout = null"></score-hud>
        </div>
        <div class="z-negative game-controls__buttons width-100 d-flex p-4" inivisible>
            <div class="d-flex justify-center grow-1">
                <div class="game-controls__button">buffer</div>
            </div>
        </div>
        <div  class="game-controls__buttons width-100 pos-absolute bottom-0 left-0 d-flex p-4 justify-between">

            <div class="game-controls__faction d-flex align-center" @click="shared.event.emit( 'viewPlayer', shared.player )">
                <div class="player-hud__champion-wrap d-flex grow-0 shrink-0 p-1">
                    <div class="player-hud__champion" :style="`background-image: url('/images/factions/${shared.faction.name}/icon.jpg')`"></div>
                </div>
                <div class="game-controls__item">
                    <i class="mr-2 icon-money"></i>{{ shared.faction.energy + shared.faction.resources }}
                </div>
                <div class="game-controls__item">
                    <i class="mr-2 icon-cards"></i>{{ shared.faction.cards.hand.length }}
                </div>

                <div class="game-controls__item">
                    <i class="mr-2 icon-target"></i>{{ shared.faction.cards.target.length ?  shared.faction.cards.target[0].target : 'none' }}
                </div>
            </div>

            <div class="d-flex justify-center width-25">
                <div v-for="item in popouts"
                     class="game-controls__button game-controls__item" @click="setPopout( item )"
                     :class="{active : popout === item }">
                        <i class="mr-2" :class="`icon-${item}`"></i>{{ item }}
                </div>
            </div>


            <div class="game-controls__faction d-flex justify-end align-center">

                <component v-if="shared.faction.focus" :is="shared.faction.focus"></component>

                <div  class="d-flex justify-end align-center" @click="setPopout( 'score' )">
                    <div class="game-controls__button game-controls__item scoreboard-text"
                         :class="{active : popout === 'score' }">
                        <i :class="`icon-score`"></i>
                    </div>

                    <div class="game-controls__item">
                        <i class="mr-2 icon-ap"></i>{{ shared.faction.ap }}
                    </div>
                    <div class="game-controls__item">
                        <i class="mr-2 icon-pp"></i>{{ shared.faction.pp }}
                    </div>
                </div>
            </div>
        </div>
        <loading-streak v-if="shared.player.active" position="bottom"></loading-streak>
    </div>
</template>


<script>
    export default {

        name: 'game-controls',
        data() {
            return {
                shared : App.state,
                popout : null,
                popouts : ['cards', 'units', 'tokens', 'plans']
            };
        },

        created(){
            this.shared.event.on( 'viewPlayer', () => this.popout = null );
            this.shared.event.on( 'viewArea', () => this.popout = null );
        },

        mounted(){
        },

        watch : {
            popout(){
                App.event.emit( 'sound', 'ui' );
            }
        },

        methods : {
            setPopout( popout ){
                this.popout = this.popout === popout ? null : popout;
            },

        }
    }
</script>


<style>
    .game-controls {
        font-size: 1.3rem;
    }

    .game-controls .loader-bar {
        height: 3px;
    }

    .game-controls__faction {
        font-size: 1.6rem;
        width: 37.5%;
    }

    .game-controls__faction .player-hud__champion {
        bottom: 0;
    }

    .game-controls__faction .game-controls__item {
        color: var(--highlight-color);
    }

    .game-controls__faction i, .game-controls__button.scoreboard-text {
        color: var(--primary-light-color);
    }

    .game-controls__buttons {
        z-index: 2;
        background-color: black;
    }

    .game-controls__item {
        display: flex;
        align-items: center;
        padding: 0 .2em;
        color: var(--primary-light-color);
        cursor: pointer;
    }

    .game-controls .icon-ap:before, .game-controls .icon-pp:before {
        bottom: 0;
    }

    .game-controls__button {
        padding: 0 .5em;
        font-size: 1.2rem;
        color: var(--primary-light-color);
    }

    .game-controls__button.active {
        color: var(--highlight-color);
    }

    .game-controls__button .note {
        color: #8a1a6f;
    }

    .plan-focus {
        font-size: .9em;
        position: relative;
        top: .1em;
    }
</style>

