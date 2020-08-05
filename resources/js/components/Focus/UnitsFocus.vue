<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        units in play :<span class="highlight ml-2">{{ units }}</span>
    </div>
</template>


<script>
    export default {

        name: 'fusion-focus',

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            units(){
                return _.unitsInPlay( this.shared.faction ).length;
            }
        }
    }
</script>


<style>

</style>

