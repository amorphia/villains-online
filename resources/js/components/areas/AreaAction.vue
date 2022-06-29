<template>
    <div class="area-action center-text highlight tooltip"
         @click.left="emitAction"
         @click.right.prevent="() => $refs.tooltip.open()"
    >
        <div class="area-action__image">
            <img v-if="icon" :src="icon" >
            <tool-tip :title="tooltipMessage" ref="tooltip">
                <!-- token -->
                <template v-if="token">
                    <div>
                        {{ token.description }}
                    </div>

                    <div v-if="token.resource" class="highlight">
                        <em>Refunded</em>: <span v-html="shared.filterText('this token grants its owner one xRx when revealed')"></span>
                    </div>

                    <div v-if="token.cost" class="highlight" v-html="shared.filterText(`This token costs xC${token.cost}x to activate`)"></div>
                </template>

                <!-- other -->
                <div v-else v-html="tooltipContent"></div>

            </tool-tip>
        </div>
        <div class="area-action__text">{{ message }}</div>
    </div>
</template>


<script>
    export default {

        name: 'area-action',
        props: ['area', 'action'],

        data() {
            return {
                shared : App.state,
            };
        },

        methods : {
            emitAction(){
                App.event.emit( 'actionClicked', [this.action, this.area.name] );
            }
        },

        computed : {

            /**
             * Returns our action's icon url
             * @returns {string}
             */
            icon(){
                // determine our token url
                if( this.token ) return `/images/factions/${this.token.faction}/tokens/${this.token.name}.png`;

                // otherwise return the appropriate static image
                return this.shared.actionTypes ? this.shared.actionTypes[ this.action ]?.img : null;
            },


            /**
             * Return Xavier blackstone if he's in this area
             * @returns {Unit|null}
             */
            xavier(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.shared.faction.units.find( unit => unit.type === 'champion' && unit.location === this.area.name );
            },


            /**
             * Return the first unrevealed token in this area if we have a token action,
             * or the token on Xavier blackstone for our Xavier action
             * @returns {Token}
             */
            token(){
                if( this.action === 'token' ) return _.firstUnrevealedToken( this.area );
                if( this.action === 'xavier' ) return this.xavier.token;
            },


            /**
             * Returns the short message for each action
             * @returns {string}
             */
            message(){
                let message =  this.shared.actionTypes[this.action]?.useMessage;
                return message ? message : '';
            },

            tooltipMessage() {
                if (this.token) return `Reval ${this.token.name} token`;
                if (this.action === 'skill') return `Activate Area skill`;
                if (this.action === 'magick') return `Cast Magick Spell`;
                if (this.action === 'loop') return `Exploit Time Loop`;
                if (this.action === 'ambush') return `Launch an Ambush`;
                if (this.action === 'materialize') return `Materialize Ghosts`;
            },

            tooltipContent() {
                if (this.action === 'skill') return `Exhaust your readied units in this area to activate this area's skill ability: <span class="highlight">${this.shared.filterText(this.area.skill)}</span>`;
                if (this.action === 'magick') return `Flip your enchanted units in this area face-up to use the witches' magick ability, then take another action.`;
                if (this.action === 'loop') return `Replace your Loop token with a token from your reserves placed face-down.`;
                if (this.action === 'ambush') return `Discard one of your revealed tokens in this area to start a battle here.`;
                if (this.action === 'materialize') return `Flip any of your Ghost units in this area face-up by paying their unit cost, then take another action.`;
                return "Default text, if you see this something didn't work right."
            }

        }
    }
</script>


<style>

    .area-action{
        background-image: linear-gradient(0deg, black, #340248);
        padding: .5rem;
        width: 6rem;
        border-radius: 5%/9%;
        margin: 0 .2rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

</style>

