<template>

    <tr class="faction-score" :class="{highlight : winner}">
        <!-- name -->
        <td class="faction-score__name">
            <img class="combat-faction_icon" :src="shared.factionIcon( this.faction.name )">
            The {{ score.faction | startCase }}
        </td>

        <!-- has victory checkbox -->
        <td class="faction-score__victory"><i class="faction-score__victory-icon" :class="score.hasVictory ? 'icon-checkbox-checked' : 'icon-checkbox-unchecked'"></i></td>

        <!-- total points -->
        <td class="faction-score__total">{{ score.total }}</td>

        <!-- area points -->
        <td class="faction-score__ap">{{ score.ap }}</td>

        <!-- plan points -->
        <td class="faction-score__pp">{{ score.pp }}</td>

        <!-- capitol token -->
        <td class="faction-score__token" v-html="capitol"></td>

        <!-- average dice roll -->
        <td class="faction-score__rolls" v-text="rollAvg"></td>
    </tr>
</template>


<script>
    export default {

        name: 'faction-score',
        props:['score', 'winner'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {

            /**
             * Return the proper capitol token image to display
             * @returns {string}
             */
            capitol(){
                // if we collected at least one token, show that token
                if( this.score.capitolToken ){
                    return `<img class="icon-image ml-3" src="/images/tokens/capitol-${this.score.capitolToken}.png">`;
                }

                // otherwise return a dummy token with the opacity turned to 0 just to properly fill the space
                return `<img class="icon-image ml-3 opacity-none" src="/images/tokens/capitol-1-points.png">`;
            },


            /**
             * Calculate the average roll for the player
             * @returns {string}
             */
            rollAvg(){
                let total_val = 0;
                let total_rolls = 0;

                this.score.rolls.forEach( (val, index) => {
                    if( !index ) return;
                    total_rolls += val;
                    total_val += val * index;
                });


                return (total_val / total_rolls).toFixed( 1 );
            }
        }
    }
</script>


<style>
    .faction-score {
        background-color: rgba(255, 131, 213, 0.11);
        box-shadow: 0px 0px 2px rgba(0,0,0,.5);
        padding: .5em;
        cursor: pointer;
    }

    .faction-score__victory-icon {
        font-size: .7em;
    }

    .faction-score__victory-icon .icon-checkbox-checked {
        color: var(--highlight-color)
    }

</style>

