<template>
    <div class="width-100 horizontal-scroll" :class="classes" ref="container" @wheel="wheel">
        <slot></slot>
    </div>
</template>


<script>
    export default {

        name: 'horizontal-scroll',
        props : ['classes'],

        data() {
            return {
            };
        },

        methods : {
            wheel( e ){
                if (e.deltaY > 0) this.$refs.container.scrollLeft += 100;
                else this.$refs.container.scrollLeft -= 100;
            },
        }
    }
</script>


<style>

</style>

