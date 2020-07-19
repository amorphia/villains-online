<template>
        <input type="hidden" :name="field.name" v-model="data.value">
</template>

<script>
    export default {
        name: 'vue-hidden',
        props: [ 'field', 'data' ],
    }
</script>


