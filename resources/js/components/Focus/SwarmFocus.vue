<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        areas with units :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'unit-areas-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.areasWithUnits( this.faction ).length;
            }
        }
    }
</script>


<style>

</style>

