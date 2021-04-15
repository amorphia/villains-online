<template>

    <div v-if="tokens.length" class="px-2 pos-relative" :class="thisClasses" :data-title="title">
        <!-- display groups of tokens -->
        <div class="tokens-hud__token d-inline-block"
             v-for="token in tokens"
             @click="tokenClicked( token )">
                <img class="tokens-hud__token-image" :class="tokenClass( token )" :src="`/images/factions/${shared.faction.name}/tokens/${token.name}.png`">
        </div>
    </div>

</template>


<script>
    export default {

        name: 'token-set',
        props: [ 'noEmit', 'tokens', 'title', 'classes', 'selected', 'noBorder' ],
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
                this.shared.event.emit( 'tokenClicked', token );
                this.$emit( 'tokenClicked', token );
            },


            /**
             * Return our token class
             * @param token
             * @returns {string|false}
             */
            tokenClass( token ){
                // if we have a selected token, but this token isn't the selected token reduce the opacity
                return this.selected && this.selected.id !== token.id ? 'opacity-5' : false;
            }
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

