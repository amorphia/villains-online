<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        areas winning :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'control-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.factionWinningAreas(
                    this.faction,
                    this.shared.data.factions,
                    this.shared.data.areas,
                    this.shared.areaLeaders
                ).length;
            },
        }
    }
</script>
