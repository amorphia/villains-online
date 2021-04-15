<script>
    export default {
        computed: {
            /**
             * return the field's title
             */
            labelTitle(){
                // if we are provided an explicit title, use that, otherwise use the field name
                let title = this.field.label ? this.field.label : this.field.name;

                // set to start case
                title = _.startCase( title );

                // is this field optional (and we aren't hiding the optional label for some reason)
                // append the word optional to the title
                title += this.field.optional && ! this.field.hideOptionalLabel ? ' (optional)' : '';

                return title;
            }
        }
    }
</script>
