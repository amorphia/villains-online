<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        units in play :<span class="highlight ml-2">{{ units }}</span>
    </div>
</template>


<script>
    export default {

        name: 'fusion-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            units(){
                return _.unitsInPlay( this.faction ).length;
            }
        }
    }
</script>
