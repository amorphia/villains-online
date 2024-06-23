<template>
    <div class="tokens-hud__token d-inline-block tooltip selected-circle"
            :class="wrapperClass"
            @click.left="tokenClicked"
            @click.right.prevent.stop="$refs.tooltip.open()"
    >
        <img class="tokens-hud__token-image"
             :class="tokenClass"
             :src="`/images/factions/${shared.faction.name}/tokens/${this.token.name}.png`">

        <token-tooltip
            :direction="direction"
            :token="token"
            ref="tooltip">
        </token-tooltip>
    </div>


</template>


<script>
    export default {
        props: [ 'token', 'noEmit', 'selected', 'direction', 'hideUnrevealed' ],
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
                App.event.emit( 'tokenClicked', this.token );
                this.$emit( 'tokenClicked', this.token );
            },
        },

        computed: {

            /**
             * Return our token class
             * @returns {string|false}
             */
            tokenClass(){
                let classes = [];
                // if we have a selected token, but this token isn't the selected token reduce the opacity
                if( this.selected && this.selected.id !== this.token.id ) classes.push( 'opacity-5' );

                return classes;
            },

            wrapperClass(){
                let classes = [];

                // if we have an unrevealed token and we set our hide unrevealed prop apply the proper styling
                if( this.hideUnrevealed && !this.token.revealed ) classes.push( 'unrevealed' );

                return classes;
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


    .tokens-hud__token.unrevealed {
        opacity : .8;
        filter: saturate(50%);
        position: relative;
        margin-bottom: .6em;
    }

    .tokens-hud__token.unrevealed::before {
        content: "";
        position: absolute;
        width: 40%;
        height: 40%;
        background-image: url(/images/icons/hidden.png);
        z-index: 3;
        left: 50%;
        top: 100%;
        background-size: contain;
        transform: translate(-50%, -70%);
    }

</style>

