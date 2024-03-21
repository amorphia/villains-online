<template>
    <div>
        <!-- active cards -->
        <div class="view-player__title">Available Orders:</div>
        <div class="view-player__active-cards">
            <img v-for="order in orders" class="view-player__card"
                 :src="`/images/factions/agency/orders/${order.name}.jpg`">
        </div>

    </div>
</template>


<script>
    export default {

        name: 'player-orders',
        props : ['faction'],

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            orders(){
                return this.faction.surveyorOrders.filter( order => order.ready && order.unlocked );
            },
        },
    }
</script>

