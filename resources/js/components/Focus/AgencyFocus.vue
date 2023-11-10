<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        agent actions :<span class="highlight ml-2 mr-4">{{ actions }}</span> events played :<span class="highlight ml-2">{{ focus }}</span>
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

            actions(){
                return this.faction.maxWoundAgentActions - this.faction.usedWoundAgentActions;
            },
        }
    }
</script>
