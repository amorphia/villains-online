<template>

    <div class="form-group d-flex align-baseline" :class="field.class + ' ' + field.name">

        <div class="form-label d-block" :for="field.name" v-text="labelTitle"></div>

        <input
            class="form-element d-none form-checkbox"
            :class="{ error : errors.has( field.name ) }"
            type="checkbox"
            :name="field.name"
            :id="field.name"
            v-model="data.value"
            @input="errors.clear( field.name )"
        >

        <label class="form-label icon-checkbox" :for="field.name"></label>

        <span class="form-error" v-text="errors.get( field.name )"></span>

    </div>
</template>


<script>

    import InputMixin from "./InputMixin";

    export default {
        name: 'vue-checkbox',
        props: [ 'field', 'data', 'errors' ],
        mixins: [InputMixin],
    }
</script>


<style>

</style>

