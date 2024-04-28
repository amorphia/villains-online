<template>
    <div>
        <!-- active cards -->
        <div class="view-player__title">{{ text }}</div>
        <div class="view-player__active-cards">
            <img v-for="order in orders" class="view-player__card"
                 :src="`/images/factions/agency/orders/${order.name}.jpg`">
        </div>

    </div>
</template>


<script>
    export default {

        name: 'player-orders',
        props : ['faction', 'ready'],

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            text(){
                return this.ready ?  "Available Orders:" : "Unlocked Orders:";
            },

            orders(){
                return this.faction.surveyorOrders.filter( order => order.unlocked && (!this.ready || order.ready) );
            },
        },
    }
</script>

