<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        resources :<span class="highlight ml-2 mr-4">{{ faction.resources }}</span>
        skills used :<span class="highlight ml-2">{{ focus }}</span>
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
            focus(){
                return this.faction.usedSkills.length;
            }
        }
    }
</script>


<style>

</style>

