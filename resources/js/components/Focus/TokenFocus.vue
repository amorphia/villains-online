<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        areas with tokens :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'token-focus',

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.areasWithTokensCount( this.shared.faction, this.shared.data.areas );
            }
        }
    }
</script>


<style>

</style>

