<template>
    <hud-popout :open="open" nohandle="true" classes="tokens-hud" @close="$emit( 'close' )">

        <div class="tokens-hud__tokens-container p-4 center-text">
            <token-set :tokens="reserves" title="Reserves" noEmit="true"></token-set>
            <token-set :tokens="unrevealed" title="Unrevealed" noEmit="true"></token-set>
            <token-set :tokens="activated" title="Activated" noEmit="true"></token-set>
        </div>

    </hud-popout>
</template>


<script>

    export default {

        name: 'tokens-hud',
        props: ['open'],
        data() {
            return {
                shared : App.state,
            };
        },

        computed : {
            /**
             * Return an array of our tokens in our reserves
             * @returns {Token[]}
             */
            reserves(){
                return this.shared.faction.tokens.filter( token => !token.location );
            },


            /**
             * Return an array of our tokens that haven't been revealed
             * @returns {Token[]}
             */
            unrevealed(){
                return this.shared.faction.tokens.filter( token => token.location && !token.revealed );
            },


            /**
             * Return an array of our tokens that have been activated
             * @returns {Token[]}
             */
            activated(){
                return this.shared.faction.tokens.filter( token => token.location && token.revealed );
            }
        },

    }
</script>
