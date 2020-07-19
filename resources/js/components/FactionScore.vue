<template>
    <tr class="faction-score" :class="{highlight : winner}">
        <td class="faction-score__name">
            <img class="combat-faction_icon" :src="factionIcon">
            The {{ score.faction | startCase }}
        </td>
        <td class="faction-score__victory"><i class="faction-score__victory-icon" :class="score.hasVictory ? 'icon-checkbox-checked' : 'icon-checkbox-unchecked'"></i></td>
        <td class="faction-score__total">{{ score.total }}</td>
        <td class="faction-score__ap">{{ score.ap }}</td>
        <td class="faction-score__pp">{{ score.pp }}</td>
        <td class="faction-score__token" v-html="capitol"></td>
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
            capitol(){
                if( this.score.capitolToken ){
                    return `<img class="icon-image ml-3" src="/images/tokens/capitol-${this.score.capitolToken}.png">`;
                }
                 return `<img class="icon-image ml-3 opacity-none" src="/images/tokens/capitol-1-points.png">`;
            },
            factionIcon(){
                return _.factionIcon( this.score.faction );
            },
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

