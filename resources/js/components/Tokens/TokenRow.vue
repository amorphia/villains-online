<template>
    <div class="area-map__tokens d-flex justify-center width-100 no-select">
        <token-slot v-for="n in area.maxTokens"
                    :area="area"
                    :token="area.tokens[n-1]"
                    :forcedtoken="forcedToken(n)"
                    :highlight="checkHighlight(n)"
                    :index="n"
                    :key="`${area.name}-${n}`"
                     @token="emitToken"
                    :effect="effect"
                ></token-slot>

    </div>
</template>


<script>
    export default {

        name: 'token-row',
        props: ['area', 'effect', 'token', 'highlight' ],

        data() {
            return {
                shared : App.state
            };
        },
        methods : {
            checkHighlight( n ){
                if( ! this.highlight || ! this.area.tokens[ n-1 ] ) return false;
                return this.highlight.id === this.area.tokens[ n-1 ].id;
            },
            forcedToken( n ){
                let existing = this.area.tokens[n-1];
                if( !existing && this.token && ( n === 1 || this.area.tokens[n-2] ) ) return this.token;
            },
            emitToken( token ){
                this.$emit('token', token );
            }
        }
    }
</script>


<style>

</style>

