<template>

    <div v-if="tokens.length" class="px-2 pos-relative" :class="thisClasses" :data-title="title">
        <!-- display groups of tokens -->
        <token-set-item
            v-for="token in tokens"
            :token="token"
            :key="token.id"
            @token-clicked="tokenClicked"
            :selected="selected"
            :noEmit="noEmit"
            :direction="direction"
        />
    </div>

</template>


<script>
    export default {

        name: 'token-set',
        props: [ 'noEmit', 'tokens', 'title', 'classes', 'selected', 'noBorder', 'direction' ],
        data() {
            return {
                shared : App.state
            };
        },

        computed : {

            /**
             * Calculate our classes
             *
             * @returns {string}
             */
            thisClasses(){
                let classes =  this.classes;

                if( !this.noBorder ){
                    classes += ' popout-hud__block';
                }

                return classes;
            }
        },

        methods : {

            /**
             * Emit token clicked event
             * @param token
             */
            tokenClicked( token ){
                if( this.noEmit ) return;
                this.$emit( 'tokenClicked', token );
            },

        }
    }
</script>


<style>



    .tokens-hud__token {
        padding: .25rem;
        width: 6vw;
        height: 6vw;
    }

    .tokens-hud__token-image {
        border-radius: 50%;
        border: .2rem solid rgba(0,0,0,.4);
    }

    .tokens-hud__token-image.highlight {
        box-shadow: 0 0 6px gold;
        border-color: var(--highlight-color);
    }

</style>

