<template>
    <div class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        units in webs :<span class="highlight ml-2">{{ focus }}</span>
    </div>
</template>


<script>
    export default {

        name: 'web-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            focus(){
                return _.webbedUnits( this.faction ).length;
            },
        }
    }
</script>


<style>

</style>

