<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        <span class="highlight mr-4">Kills:</span>
        <div v-for="(value, name) of focus" class="d-flex align-center mr-3">
            <div class="player-hud__champion mr-2" :style="`background-image : url('/images/factions/${name}/icon.jpg');`"></div> : {{value}}
        </div>
    </div>
</template>


<script>
    export default {

        name: 'spider-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.factionKillsPerEnemy( this.faction, this.shared.data.factions );
            },
        }
    }
</script>

<style>
    .plan-focus .player-hud__champion {
        width: 20px;
        height: 20px;
    }
</style>
