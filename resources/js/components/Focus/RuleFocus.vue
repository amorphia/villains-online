<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        total :<span class="highlight ml-2 mr-3">{{ rules.total }}</span>
        areas :<span class="highlight ml-2 mr-3">{{ rules.areas }}</span>
        same area :<span class="highlight ml-2 mr-3">{{ rules.stack }}</span>
    </div>
</template>


<script>
    export default {

        name: 'rule-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            rules(){
                return _.rulesPlayed( this.faction, this.shared.data.areas );
            }
        }
    }
</script>


<style>

</style>

