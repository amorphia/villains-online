<template>
    <div class="form-group" :class="field.class + ' ' + field.name">

        <label class="form-label d-block" :for="field.name" v-text="labelTitle"></label>

        <textarea
            class="form-element width-100"
            :class="{ error : errors.has( field.name ) }"
            :name="field.name"
            :required="!field.optional"
            :rows="field.rows ? field.rows : 10"
            :placeholder="field.placeholder"
            v-model="data.value"
            @input="errors.clear( field.name )"
        ></textarea>

        <span class="form-error" v-text="errors.get( field.name )"></span>

    </div>
</template>


<script>

    import InputMixin from "./InputMixin";

    export default {
        name: 'vue-textarea',
        props: [ 'field', 'data', 'errors' ],
        mixins: [InputMixin],
    }
</script>


<style>

</style>

