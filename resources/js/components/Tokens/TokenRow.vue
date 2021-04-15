<template>
    <div class="area-map__tokens d-flex justify-center width-100 no-select">
        <token-slot v-for="index in tokenSlots"
                    :area="area"
                    :token="area.tokens[index - 1]"
                    :forcedtoken="forcedToken( area.tokens[index - 1], index )"
                    :highlight="checkHighlight( area.tokens[index - 1] )"
                    :index="index"
                    :key="`${area.name}-${index}`"
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
        computed : {
            /**
             * Return the number of token slots to display
             * @returns {number}
             */
            tokenSlots(){
                return Math.max( this.area.tokens.length, this.area.maxTokens )
            }
        },

        methods : {
            /**
             * Should we highlight the given token?
             *
             * @param token
             * @returns {boolean}
             */
            checkHighlight( token ){
                // if we aren't highlighting anything, or don't have the given token return false
                if( ! this.highlight || ! token ) return false;

                // otherwise if our highlight token is the given token return true
                return this.highlight.id === token.id;
            },


            /**
             * Check if we should force a token in the given position
             */
            forcedToken( token, index ){
                if( !token
                    && this.token
                    && ( index === 1 || this.area.tokens[ index - 2 ] ) ) return this.token;
            },


            /**
             * Emit token event
             *
             * @param token
             */
            emitToken( token ){
                this.$emit('token', token );
            }
        }
    }
</script>


