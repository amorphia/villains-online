<template>
    <player-prompt classes="">
        <div class="p-5 center-text final-score">

            <div class="victory">
                Victory for The {{ winner | startCase }}!
            </div>

            <table class="final-scores__table width-50 pull-center mb-3">
                <tr>
                    <th class="faction-score__name-header">faction name</th>
                    <th class="faction-score__victory-header">objective</th>
                    <th class="faction-score__total-header">total points</th>
                    <th class="faction-score__ap-header"><img class="icon-image" src="/images/icons/ap.png"></th>
                    <th class="faction-score__pp-header"><img class="icon-image" src="/images/icons/pp.png"></th>
                    <th class="faction-score__token-header">capitol token</th>
                </tr>
                <faction-score v-for="(score, index) in scores"
                               :score="score"
                               :key="score.faction"
                               :winner="index === 0"></faction-score>
            </table>

            <end-game>
                <div class="button d-inline-block final-score__conclude">Conclude Game</div>
            </end-game>

        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'final-scores',

        data() {
            return {
                shared : App.state,
            };
        },


        methods : {
            closeGame(){

            }
        },

        computed : {
            winner(){
                return this.scores[0].faction;
            },
            scores(){
                return this.shared.player.prompt.data;
            },

        },

    }
</script>


<style>

    .final-score {
        padding-bottom: .5rem;
    }

    .victory {
        font-size: 4.5rem;
        text-transform: uppercase;
        z-index: 3;
        color: #ffff2a;
        text-shadow: 0 0 5px var(--highlight-color);
        letter-spacing: .1em;
        white-space: nowrap;
    }

    .final-scores__table {
        width: 60rem;
        font-size: 1.75em;
        border-spacing: 4px;
        color: var(--primary-light-color)
    }

    .final-scores__table th {
        border-bottom: 1px solid;
        border-left: 1px solid;
        font-size: .8em;
        text-transform: uppercase;
        padding: 0.2em 0.5em;
        white-space: nowrap;
        font-family: var(--secondary-font);
        border-color: #e953cd;
        font-weight: 200;
        overflow: hidden;
    }

    .final-scores__table td {
        padding: .5rem .3rem;
    }

</style>

