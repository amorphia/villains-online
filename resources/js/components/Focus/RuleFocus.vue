<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        total :<span class="highlight ml-2 mr-3">{{ rules.total }}</span>
        areas :<span class="highlight ml-2 mr-3">{{ rules.areas }}</span>
        stack :<span class="highlight ml-2 mr-3">{{ rules.stack }}</span>
    </div>
</template>


<script>
    export default {

        name: 'rule-focus',

        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            rules(){
                return _.rulesPlayed( this.shared.faction, this.shared.data.areas );
            }
        }
    }
</script>


<style>

</style>

