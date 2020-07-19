<template>
    <form v-if="!hide" @submit.prevent="onSubmit" :enctype="hasFile">
        <template v-for="field in schema">
            <component
                :is="field.type ? 'vue-' + field.type : 'vue-input'"
                :field="field"
                :errors="form.errors"
                :sending="sending"
                :data.sync="form[field.name]">
                class="field.class"
            </component>
        </template>

        <div class="form-group">
            <input type="submit" class="form-submit form-element uppercase bg-hover-light button bg-side white secondary uppercase" :class="submitclass" value="submit">
            <div class="loader-bar width-100 loader-bar-shift" v-if="sending">
                <div class="loader-bar__streak"></div>
            </div>
        </div>
    </form>
</template>


<script>
    import Form from '../../partials/_form.js';

    export default {

        name: 'vue-form',
        props: ['method', 'action', 'schema', 'submitclass', 'hide' ],

        data() {
            return {
                form : null,
                sending : false,
                hasFile : ''
            };
        },

        methods : {

            setInputs(){
                let inputs = {};
                let hasFiles = false;

                this.schema.forEach( item => {
                    inputs[item.name] = { value : item.value ?? '' };

                    if( item.type === 'file' ){
                        inputs[item.name].file = true;
                        hasFiles = true;
                    }
                });

                this.form = new Form( inputs, this.action, this.method );

                if( hasFiles ){
                    this.form.hasFiles();
                    this.hasFile = 'multipart/form-data';
                }

            },

            onSubmit(){
                this.sending = true;

                this.form.submit()
                    .then( response => this.$emit( 'formSuccess', response ) )
                    .catch( errors => this.$emit( 'formError', errors ) )
                    .finally( () => this.sending = false );
            },
        },

        created(){
            this.setInputs();
        },

    }
</script>


<style>
    .loader-bar-shift {
        margin-top: -1em;
    }
</style>

