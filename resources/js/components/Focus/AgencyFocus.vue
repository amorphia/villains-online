<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        events played :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'event-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return this.faction.eventCardsPlayed;
            },
        }
    }
</script>
