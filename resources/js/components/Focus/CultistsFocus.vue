<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        total kills :<span class="highlight ml-2">{{ kills }}</span>
    </div>
</template>


<script>
    export default {

        name: 'fusion-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            kills(){
                return _.factionKills( this.faction, this.shared.data.factions ).length;
            }
        }
    }
</script>

