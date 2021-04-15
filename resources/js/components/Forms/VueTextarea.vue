<template>
    <div class="form-group" :class="field.class + ' ' + field.name">

        <!-- label -->
        <label class="form-label d-block" :for="field.name" v-text="labelTitle"></label>

        <!-- input -->
        <textarea
            class="form-element width-100"
            :class="classes"
            :name="field.name"
            :required="!field.optional"
            :rows="field.rows ? field.rows : 10"
            :placeholder="field.placeholder"
            v-model="data.value"
            @input="errors.clear( field.name )"
        ></textarea>

        <!-- error -->
        <span class="form-error" v-text="errors.get( field.name )"></span>
    </div>
</template>


<script>
    import InputMixin from "./InputMixin";

    export default {
        name: 'vue-textarea',
        props: [ 'field', 'data', 'errors' ],
        mixins: [InputMixin],

        computed : {
            /**
             * return our input classes object
             */
            classes(){
                return {
                    error : this.errors.has( this.field.name ),
                    'should-focus' : this.field.focus
                }
            }
        }
    }
</script>
