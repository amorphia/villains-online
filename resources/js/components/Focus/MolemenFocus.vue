<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        predicted captures:<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            /**
             * Returns the number of captured enemy tokens we are predicted to have at the end of the turn
             * @returns {number}
             */
            focus(){
                // start with the number we already have
                let captured = 0;

                let winning =  _.factionWinningAreas(
                    this.faction,
                    this.shared.data.factions,
                    this.shared.data.areas,
                    this.shared.areaLeaders
                );

                // for each area we are winning, see if another player currently controls it
                // if they do, increment our total
                winning.forEach( areName => {
                    let area = this.shared.data.areas[ areName ];
                    if( area.owner && area.owner !== this.faction.name ) captured++;
                });

                return captured;
            },
        }
    }
</script>


<style>

</style>

