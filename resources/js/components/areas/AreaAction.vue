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
                shared : App.state
            };
        },

        methods : {
            emitAction(){
                App.event.emit( 'actionClicked', [this.action, this.area.name] );
            }
        },

        computed : {

            icon(){
                if( this.token ) return `/images/factions/${this.token.faction}/tokens/${this.token.name}.png`;
                if( this.action === 'skill' ) return `/images/icons/skilled.png`;
                if( this.action === 'magick' ) return `/images/icons/enchanted.png`;
            },

            xavier(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.shared.faction.units.find( unit => unit.type === 'champion' && unit.location === this.area.name );
            },

            token(){
                if( this.action === 'token' ) return _.firstUnrevealedToken( this.area );
                if( this.action === 'xavier' ) return this.xavier.token;
            },

            message(){
                switch( this.action ){
                    case 'token': return `reveal token`;
                    case 'skill': return 'use skill';
                    case 'xavier': return `xavier token`;
                    case 'magick': return 'use magick';
                }
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

