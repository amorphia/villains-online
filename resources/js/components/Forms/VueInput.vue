<template>

    <div class="form-group" :class="field.class + ' ' + field.name">

        <label class="form-label d-block" :for="field.name" v-text="labelTitle"></label>

        <input
            class="form-element width-100"
            :class="{ error : errors.has( field.name ) }"
            type="text"
            :name="field.name"
            :placeholder="field.placeholder"
            :required="!field.optional"
            v-model="data.value"
            @input="errors.clear( field.name )"
        >

        <span class="form-error" v-text="errors.get( field.name )"></span>

    </div>
</template>


<script>

    import InputMixin from "./InputMixin";

    export default {
        name: 'vue-input',
        props: [ 'field', 'data', 'errors' ],
        mixins: [InputMixin],
    }
</script>


<style>

</style>

