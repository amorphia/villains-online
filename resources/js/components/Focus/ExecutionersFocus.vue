<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        condemned: <span class="highlight ml-2 mr-4">{{ faction.condemned.join(", ") }}</span> kills :<span class="highlight ml-2">{{ kills }}</span>
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
                return _.factionCondemnedKills( this.faction, this.shared.data.factions );
            }
        }
    }
</script>

