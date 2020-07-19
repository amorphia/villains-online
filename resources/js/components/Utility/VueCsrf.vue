<template>
    <div v-if="shared.csrf">
        <meta name="csrf-token" :content="shared.csrf">
        <input type='hidden' name='_token' v-model='shared.csrf'>
    </div>
</template>

<script>

    export default {

        name: 'vue-csrf',

        methods : {

            // fetch the csrf token from the server
            getCsrf(){
                axios.get('/admin/csrf' )
                    .then( response => {
                        this.shared.csrf = response.data;
                    })
                    .catch( errors => {
                        console.log( errors );
                    });
            }
        },

        mounted() {

            if( ! this.shared.csrf ){

                // if the csrf property hasn't been set yet on the shared state init it
                this.shared.csrf = 'loading...';

                // then load the csrf token via ajax
                this.getCsrf();
            }

        },

        data() {
            return {
                shared : App.state,
            };
        }
    }
</script>
