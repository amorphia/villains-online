<template>
    <div class="form-group d-flex align-baseline" :class="field.class + ' ' + field.name">

        <!-- pseudo label used to display title (as the actual label is used to display a styled checkbox) -->
        <div class="form-label d-block" :for="field.name" v-text="labelTitle"></div>

        <!-- input -->
        <input
            class="form-element d-none form-checkbox"
            :class="{ error : errors.has( field.name ) }"
            type="checkbox"
            :name="field.name"
            :id="field.name"
            v-model="data.value"
            @input="errors.clear( field.name )"
        >

        <!-- label used to display styled checkbox -->
        <label class="form-label icon-checkbox" :for="field.name"></label>

        <!-- errors -->
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


