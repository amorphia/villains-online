<template>
    <div  class="d-flex plan-focus mr-4 primary-light align-center" :class="classes">
        Chaos Achieved :<span class="highlight ml-2">{{ faction.chaos }} <span v-if="faction.chaosLevel" class="red">{{ faction.chaosLevel }}</span></span>
    </div>
</template>


<script>
    export default {

        name: 'kill-areas-focus',
        props: ['classes', 'faction'],

        data() {
            return {
                shared : App.state
            };
        },
    }
</script>


<style>

</style>

