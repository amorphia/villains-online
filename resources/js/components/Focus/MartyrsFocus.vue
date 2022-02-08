<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        <span>dead units:<span class="highlight ml-2">{{ dead }}</span></span>
        <span class="ml-3">patsies in reserves :<span class="highlight ml-2">{{ reserves }}</span></span>
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
            dead(){
                return _.factionDead( this.faction ).length;
            },

            reserves(){
                return _.factionReserves( this.faction, { type: 'patsy' } ).length;
            }
        }
    }
</script>

