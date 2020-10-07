<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        areas with tokens :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'token-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.areasWithTokensCount( this.faction, this.shared.data.areas );
            }
        }
    }
</script>


<style>

</style>

