<template>
    <div  class="d-flex justify-center plan-focus mr-4 primary-light align-center">
        fusion count :<span class="highlight ml-2">{{ shared.faction.fusion }}</span>
    </div>
</template>


<script>
    export default {

        name: 'fusion-focus',

        data() {
            return {
                shared : App.state
            };
        }
    }
</script>


<style>

</style>

