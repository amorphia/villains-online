<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        <span class="mr-4">skips :<span class="highlight ml-2">{{ skips }}</span></span>
        most tokens :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'most-tokens-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.factionAreasWithMostTokens( this.faction, this.shared.data.areas );
            },
            skips(){
                return this.faction.skips.max - this.faction.skips.used;
            }
        }
    }
</script>


<style>

</style>

