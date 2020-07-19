<template>
    <div class="loader-bar" :class="position">
        <div class="loader-bar__streak"></div>
    </div>
</template>


<script>
    export default {

        name: 'loading-streak',
        props : ['position'],
        data() {
            return {

            }
        }
    }
</script>


<style>
    .loader-bar.top {
        top: 0;
    }
    .loader-bar.bottom {
        bottom: 0;
    }
</style>

