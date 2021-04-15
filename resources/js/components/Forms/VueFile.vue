<template>

    <div class="form-group" :class="field.class + ' ' + field.name">

        <!-- pseudo label to display title (as we use the actual label element to style the input) -->
        <div v-if="field.label" class="form-label d-block" v-text="labelTitle"></div>

        <!-- styled label to replace input in the UI-->
        <label
            class="d-block form-file__label form-element secondary uppercase center-text bold pointer"
            :class="{ error : errors.has( field.name ) }"
            :for="field.name"
        >
            <div v-if="! data.value"><i class="icon-upload mr-3"></i> UPLOAD A FILE</div>
            <p v-if="data.value" v-text="data.value.name"></p>
        </label>

        <!-- input -->
        <input
            class="form-file"
            :disabled="sending"
            @change="fileChange"
            :required="!field.optional"
            :accept="field.accept"
            :name="field.name"
            type="file"
            :id="field.name">

        <!-- errors -->
        <span class="form-error" v-text="errors.get( field.name )"></span>

    </div>
</template>


<script>

    import InputMixin from "./InputMixin";

    export default {
        name: 'vue-file',
        props: [ 'field', 'data', 'errors', 'sending', 'max-size' ],
        mixins: [InputMixin],
        data() {
            return {
                file: null,
                max : null // max file size in MB
            }
        },

        methods : {

            /**
             * Process a file change event
             *
             * @param {object} event
             */
            fileChange( event ){

                // clear our errors
                this.errors.clear( this.field.name );

                let file = event.target.files[0];
                let fileSize = file.size / 1024 / 1024;

                // check file size
                if( this.field.max && fileSize > this.field.max ){
                    this.errors.set(
                        this.field.name,
                        `File size (${ fileSize.toFixed(1) }MB) exceeds the limit of ${ this.field.max }MB`
                    );
                }

                // set this file as our input value
                this.data.value = file;
            }
        }
    }
</script>


<style>
    .form-file {
        width: .1px;
        height: .1px;
        opacity: 0;
        overflow: hidden;
        position: absolute;
        z-index: -1;
    }

    .form-file__label {
        position: relative;
        color: rgba(0,0,0,.5);
    }

</style>

