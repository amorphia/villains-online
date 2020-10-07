<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        current : <span class="highlight ml-2 mr-4">{{ faction.captured.current }}</span>
        predicted :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'captured-markers-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                let captured = this.faction.captured.current;

                let winning =  _.factionWinningAreas(
                    this.faction,
                    this.shared.data.factions,
                    this.shared.data.areas,
                    this.shared.areaLeaders
                );

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

