<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        areas with units :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'unit-areas-focus',

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.areasWithUnits( this.shared.faction ).length;
            }
        }
    }
</script>


<style>

</style>

