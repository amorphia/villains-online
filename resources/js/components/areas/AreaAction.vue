<template>
    <div class="area-action center-text highlight pointer" @click="emitAction">
        <div class="area-action__image">
            <img v-if="icon" :src="icon">
        </div>
        <div class="area-action__text">{{ message }}</div>
    </div>
</template>


<script>
    export default {

        name: 'area-action',
        props: ['area','action'],

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
                return this.shared.actionTypes[ this.action ]?.img;
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

