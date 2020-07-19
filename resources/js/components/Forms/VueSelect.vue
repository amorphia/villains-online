<template>

    <div class="form-group" :class="field.class + ' ' + field.name">

        <label class="form-label d-block" :for="field.name" v-text="labelTitle"></label>

        <select
            class="form-element width-100"
            :name="field.name"
            v-model="data.value"
        >
            <option v-for="option in field.options" :value="option.value">{{ option.text }}</option>
        </select>

    </div>
</template>


<script>

    import InputMixin from "./InputMixin";

    export default {
        name: 'vue-select',
        props: [ 'field', 'data' ],
        mixins: [InputMixin],
    }
</script>


<style>

</style>

