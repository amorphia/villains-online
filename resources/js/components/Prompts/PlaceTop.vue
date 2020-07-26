<template>

</template>


<script>
    export default {

        name: 'place-top',

        data() {
            return {
                shared : App.state,
            };
        },
        methods : {
            tokenClicked( token ){
                if( token.location ) return;
                this.shared.token = this.shared.token && this.shared.token.id === token.id  ? null : token;
            },
        },
        computed : {

            reserves(){
                return this.shared.faction.tokens.filter( token => !token.location );
            },
        }
    }
</script>


<style>

</style>

