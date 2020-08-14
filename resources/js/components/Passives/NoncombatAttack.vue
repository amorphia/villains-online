<template>
    <player-prompt classes="">
        <div class="overflow-auto px-5">
            <div class="width-100 d-flex justify-center flex-column align-center pb-5">

                <div class="title mb-4">Attack Results</div>

                <div class="py-3 pt-4 d-flex flex-wrap">

                    <div v-for="attack in attacks"
                         class="non-combat-attack highlight d-flex p-5 m-3 align-center"
                         :class="`pip-bg-${attack.area}`">

                        <unit-icon v-if="attack.unit"
                                   :unit="attack.unit"
                                   noSelect="true"
                                   :classes="`faction-${attack.faction} mr-3 z-2`"></unit-icon>

                        <img class="non-combat-attack__victim"
                             :class="{ 'no-unit' : !attack.unit}"
                             :src="victimImage( attack.victim )">

                            <img v-for="roll in attack.rolls"
                                 class="last-attack__roll z-2"
                                 :class="{'saturate-0' : roll < attack.toHit}"
                                 :src="`/images/icons/attack-${roll}.png`">
                    </div>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'noncombat-attack',
        data() {
            return {
                shared : App.state,
            };
        },

        methods : {

            victimImage( victim ){
                return this.factionIcon( victim );
            },

            factionIcon( factionName ){
                return _.factionIcon( factionName );
            },

        },

        computed : {

            attacks(){
                return this.data.output.filter( attack => attack );
            },

            data(){
                return this.shared.player.prompt.data;
            },

        }
    }
</script>


<style>

    .non-combat-attack {
        border: 1px solid;
        position: relative;
        background-size: cover;
        background-position: center;
        box-shadow: inset 0px 0px 12px 4px rgba(0,0,0,.5), 0 0 9px rgba(0,0,0,.5);
        flex-grow: 1;
        justify-content: center;
    }

    .non-combat-attack__victim {
        width: 2.5rem;
        z-index: 1;
        border: 1px solid;
        box-shadow: 0 0 8px 3px rgba(0,0,0,.5);
        margin: 0 .5em 0 -1em;
    }

    .non-combat-attack__victim.no-unit {
        position: absolute;
        left: 50%;
        z-index: 3;
        top: 0;
        margin: unset;
        transform: translate(-50%,-50%);
    }

</style>

