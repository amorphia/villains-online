<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        areas exterminated :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'exterminate-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                let areasExterminated = 0;

                Object.values( this.shared.data.areas ).forEach( area => {
                    if( _.areaExterminated( area, this.shared.data.factions ) === this.faction.name ) areasExterminated++;
                });

                return areasExterminated;
            },
        }
    }
</script>


<style>

</style>

