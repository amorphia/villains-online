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
                    <th class="faction-score__rolls-header">AVG roll</th>
                </tr>
                <faction-score v-for="(score, index) in scores"
                               :score="score"
                               :key="score.faction"
                               :winner="index === 0"></faction-score>
            </table>


            <div class="rolls-table d-flex width-50 pull-center my-5 p-3">
                <div v-for="(count, roll) in rolls" class="rolls-table__column d-flex flex-column width-10 align-center" :hidden="!roll">
                    <div class="rolls-table__roll-header">{{ roll }}</div>
                    <div class="rolls-table__bar-container p-3 d-flex align-end">
                        <span class="rolls-table__bar width-100 d-block" :style="{ height : barHeight( count ) }"></span>
                    </div>
                    <div class="rolls-table__bar-count highlight">{{ count }}</div>
                </div>
            </div>


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
            barHeight( count ){
                return ( ( count / this.maxRollCount ) * 100 ) + '%';
            }
        },

        computed : {
            winner(){
                return this.scores[0].faction;
            },
            scores(){
                return this.shared.player.prompt.data.scores;
            },
            rolls(){
                return this.shared.player.prompt.data.rolls;
            },
            maxRollCount(){
                let max = 0;
                this.rolls.forEach( count => {
                   if( count > max ) max = count;
                });
                return max;
            }

        },

    }
</script>


<style>

    .rolls-table {
        font-family: var(--primary-font);
        font-size: 1.5rem;
        background-color: rgba(255, 131, 213, 0.11);
    }


    .rolls-table__bar-container {
        width: 100%;
        height: 5rem;
    }

    .rolls-table__bar {
        background-color: var(--highlight-color);
        border-bottom: 2px solid var(--highlight-color);
    }

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

