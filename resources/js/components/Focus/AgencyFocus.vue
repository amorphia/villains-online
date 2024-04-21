<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
         assassinated :<span class="highlight ml-2">{{ focus }}</span>
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
                if( !this.faction.hasKilledChampion.length ){
                    return "none";
                }

                return this.faction.hasKilledChampion.join(', ');
            },
        }
    }
</script>
