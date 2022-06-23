<template>
    <div class="tokens-hud__token d-inline-block pos-relative" @click.left="tokenClicked" @click.right.prevent="$refs.tooltip.open()">
        <img class="tokens-hud__token-image"
             :class="tokenClass"
             :src="`/images/factions/${shared.faction.name}/tokens/${this.token.name}.png`">

        <tool-tip
            :id="token.id"
            :title="token.name"
            :content="token.description"
            :footnote="tokenFootnote"
            :direction="direction"
            ref="tooltip" />
    </div>


</template>


<script>
    export default {
        props: [ 'token', 'noEmit', 'selected', 'direction' ],
        data() {
            return {
                shared : App.state
            };
        },


        methods : {
            /**
             * Emit token clicked event
             */
            tokenClicked(){
                if( this.noEmit ) return;
                this.shared.event.emit( 'tokenClicked', this.token );
                this.$emit( 'tokenClicked', this.token );
            },
        },

        computed: {

            /**
             * Return our token class
             * @returns {string|false}
             */
            tokenClass(){
                // if we have a selected token, but this token isn't the selected token reduce the opacity
                return this.selected && this.selected.id !== this.token.id ? 'opacity-5' : false;
            },

            tokenFootnote(){
                if(this.token?.resource) return "refunded: gain 1 resource when you reveal this token";

                if(this.token?.cost) return `you must pay ${this.token.cost} to activate this token`;

                return null;
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

