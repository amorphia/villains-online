<template>
    <div class="area-map__token-space ratio-square"
         :class="computeClasses"
         @click="emitToken">
        <img v-if="tokenImage" class="area-map__token" :src="tokenImage">
    </div>
</template>


<script>
    export default {

        name: 'token-slot',
        props: ['area', 'index', 'token', 'forcedtoken', 'highlight', 'effect' ],
        data() {
            return {
                shared : App.state,
            };
        },

        methods : {
            emitToken(){

                if( this.token ){
                    this.$emit( 'token', this.token );
                }

                if( this.forcedtoken ){
                    this.$emit( 'token', this.forcedtoken );
                }
            }
        },

        computed : {

            computeClasses(){
                let classes = [];

                if( this.canSeeToken && !this.highlight ){
                    classes.push( 'unrevealed' );
                }

                if( this.area ){
                    classes.push( `${this.area.name}-${this.index}` );
                }

                if( ( this.token && this.token.selected )
                    || this.forcedtoken && this.forcedtoken.faction
                    || this.highlight ){
                    classes.push( 'selected' );
                }



                return classes.join(' ');
            },

            canSeeToken(){
                if( ! this.token || this.token.revealed ) return false;

                if( this.token.faction === this.shared.faction.name
                    || this.shared.faction.tokenSpy.includes( this.token.location )
                    || this.ministerSpy
                ) return true;

            },

            ministerSpy(){
                if( this.shared.faction.name !== 'bureau' ) return;

                let ministerInArea = !! this.shared.faction.units.find( unit => unit.type === 'champion' && _.unitInArea( unit, this.area ) );
                let firstUnrevealedEnemy = _.firstUnrevealedToken( this.area, { enemy : this.shared.faction.name });

                return ministerInArea && this.token.id === firstUnrevealedEnemy.id;
            },

            tokenImage(){
                let image = false;
                let token;

                if( this.token && this.token.faction ) {
                    token = this.token;
                    image = 'back';
                    if (token.revealed || this.canSeeToken ) image = token.name;
                } else if( this.forcedtoken && this.forcedtoken.faction ){
                    token = this.forcedtoken;
                    image = token.name;
                }

                return image ? `/images/factions/${token.faction}/tokens/${image}.png` : false;
            }
        }
    }
</script>


<style>
    .area-map__token-space {
        background-repeat: no-repeat;
        background-size:cover;
        position: relative;
        bottom: .5vw;
        width: 13%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-shadow: inset 0 0 0.5em 0px rgba(0,0,0,1);
    }

    .area-map__token {
        width: 90%;
        height: 90%;
        border-radius: 50%;
        z-index: 2;
    }

    .area-map__token-space.unrevealed .area-map__token {
        opacity : .8;
        filter: saturate(50%);
    }

    .area-map__token-space.unrevealed:not(.selected):before {
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



    .church-1 { background-image: url(/images/areas/church-1.png) }
    .church-2 { background-image: url(/images/areas/church-2.png) }
    .church-3 { background-image: url(/images/areas/church-3.png) }
    .church-4 { background-image: url(/images/areas/church-4.png) }
    .church-5 { background-image: url(/images/areas/church-5.png) }

    .sewers-1 { background-image: url(/images/areas/sewers-1.png) }
    .sewers-2 { background-image: url(/images/areas/sewers-2.png) }
    .sewers-3 { background-image: url(/images/areas/sewers-3.png) }
    .sewers-4 { background-image: url(/images/areas/sewers-4.png) }
    .sewers-5 { background-image: url(/images/areas/sewers-5.png) }

    .police-1 { background-image: url(/images/areas/police-1.png) }
    .police-2 { background-image: url(/images/areas/police-2.png) }
    .police-3 { background-image: url(/images/areas/police-3.png) }
    .police-4 { background-image: url(/images/areas/police-4.png) }
    .police-5 { background-image: url(/images/areas/police-5.png) }

    .subway-1 { background-image: url(/images/areas/subway-1.png) }
    .subway-2 { background-image: url(/images/areas/subway-2.png) }
    .subway-3 { background-image: url(/images/areas/subway-3.png) }
    .subway-4 { background-image: url(/images/areas/subway-4.png) }
    .subway-5 { background-image: url(/images/areas/subway-5.png) }

    .capitol-1 { background-image: url(/images/areas/capitol-1.png) }
    .capitol-2 { background-image: url(/images/areas/capitol-2.png) }
    .capitol-3 { background-image: url(/images/areas/capitol-3.png) }
    .capitol-4 { background-image: url(/images/areas/capitol-4.png) }
    .capitol-5 { background-image: url(/images/areas/capitol-5.png) }
    .capitol-6 { background-image: url(/images/areas/capitol-6.png) }

    .laboratory-1 { background-image: url(/images/areas/laboratory-1.png) }
    .laboratory-2 { background-image: url(/images/areas/laboratory-2.png) }
    .laboratory-3 { background-image: url(/images/areas/laboratory-3.png) }
    .laboratory-4 { background-image: url(/images/areas/laboratory-4.png) }
    .laboratory-5 { background-image: url(/images/areas/laboratory-5.png) }

    .university-1 { background-image: url(/images/areas/university-1.png) }
    .university-2 { background-image: url(/images/areas/university-2.png) }
    .university-3 { background-image: url(/images/areas/university-3.png) }
    .university-4 { background-image: url(/images/areas/university-4.png) }
    .university-5 { background-image: url(/images/areas/university-5.png) }

    .bank-1 { background-image: url(/images/areas/bank-1.png) }
    .bank-2 { background-image: url(/images/areas/bank-2.png) }
    .bank-3 { background-image: url(/images/areas/bank-3.png) }
    .bank-4 { background-image: url(/images/areas/bank-4.png) }
    .bank-5 { background-image: url(/images/areas/bank-5.png) }

    .factory-1 { background-image: url(/images/areas/factory-1.png) }
    .factory-2 { background-image: url(/images/areas/factory-2.png) }
    .factory-3 { background-image: url(/images/areas/factory-3.png) }
    .factory-4 { background-image: url(/images/areas/factory-4.png) }
    .factory-5 { background-image: url(/images/areas/factory-5.png) }
</style>

