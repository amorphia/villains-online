<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        skills used :<span class="highlight ml-2">{{ focus }}</span>
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
            focus(){
                return this.shared.faction.usedSkills.length;
            }
        }
    }
</script>


<style>

</style>

