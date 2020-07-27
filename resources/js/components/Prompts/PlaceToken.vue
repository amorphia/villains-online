<template>
        <div class="place-token-top p-2 d-flex justify-center align-center">
            <button class="button button-empty place-token__button right-text" @click="passToken">PASS</button>

            <div class="place-token__tokens center-text">
                <token-set
                    :tokens="reserves"
                    classes="one-line"
                    :selected="token"
                    noBorder="true"
                ></token-set>
            </div>

            <button class="button place-token__button" @click="placeToken" :disabled="saveDisabled">place token</button>
        </div>
</template>


<script>
    export default {

        name: 'place-token',
        data() {
            return {
                shared : App.state,
                areaIndex : 0,
                token : null,
            };
        },

        watch : {
            areaIndex(){
                if( this.xavier ){
                    if( this.areaIndex === -1 ){
                        this.$set( this.xavier, 'isSelected', true );
                    } else {
                        this.$set( this.xavier, 'isSelected', false );
                    }
                }
                this.shared.event.emit('areaSelected', this.area );
            },
            'shared.data.playerAction'(){
                this.reset();
            }
        },

        mounted(){
            this.shared.event.on( 'tokenClicked', this.tokenClicked );
            this.shared.event.on( 'areaClicked', this.areaClicked );
            this.shared.event.on( 'xavierClicked', this.xavierClicked );

            if( this.canXavier ){
                this.shared.showXavier = true;
            }

            this.$nextTick( () => {
                this.shared.event.emit('areaSelected', this.area );
            });

        },

        computed : {

            xavier(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.shared.faction.units.find( unit => unit.type === 'champion' );
            },

            canXavier(){
                if( this.shared.faction.name !== 'society' ) return;
                return ! this.xavier.token;
            },

            saveDisabled(){
                if( !this.token || ( this.shared.faction.resources + this.shared.faction.energy ) < this.shared.faction.tokenCost ) return true;
            },

            reserves(){
                return this.shared.faction.tokens.filter( token => !token.location );
            },

            area(){
                if( this.areaIndex === -1 ) return { name : this.xavier.location, type: 'xavier' };
                return this.availableAreas[this.areaIndex];
            },

            availableAreas(){
                let areas = [];
                _.forEach( this.shared.data.areas, area => {
                    if( area.tokens.length < area.maxTokens ){
                        areas.push( area );
                    }
                } );
                return areas;
            }
        },

        methods : {

            reset(){
                this.removeToken();
            },

            removeToken(){
                if( this.token ){
                    this.$set( this.token, 'place', null );
                    this.token = null;
                }

                if( this.xavier && this.xavier.placeToken ){
                    this.$set( this.xavier, 'placeToken', null );
                }

                this.shared.token = null;
            },

            setToken( token ) {
                this.token = token;

                if( this.area.type === 'xavier' ){
                    this.placeXavierToken()
                } else {
                    this.$set( this.token, 'place', this.area.name );
                }

                this.shared.token = this.token;
            },

            tokenClicked( token ){
                if( token.location ) return;
                if( this.token && this.token.id === token.id ){
                    this.removeToken();
                } else {
                    this.setToken( token );
                }
            },

            xavierClicked(){
                if( this.xavier.token ) return;

                console.log( 'xavier clicked' );

                this.areaIndex = -1;
                this.shared.event.emit('areaSelected', { name : this.xavier.location } );

                if( this.xavier.placeToken && this.xavier.placeToken.id ===  this.token.id ){
                    this.removeToken();
                } else if( this.token ){
                    this.placeXavierToken();
                }
            },

            placeXavierToken(){
                this.$set( this.xavier, 'placeToken', this.token );
                this.$set( this.token, 'place', 'xavier' );
            },

            areaClicked( area ){
                let index = _.findIndex( this.availableAreas, item => item.name === area.name );
                if( index === -1 ) return;

                console.log( 'area clicked' );
                this.areaIndex = index;

                if( this.token ){
                    this.$set( this.token, 'place', this.area.name );
                    if( this.xavier ){
                        this.$set( this.xavier, 'placeToken', null );
                    }
                }
            },

            placeToken(){
                this.shared.respond( 'place-token', 'place', this.token.place, this.token.id );
                this.shared.showXavier = false;
                this.removeToken();
            },

            passToken(){
                this.shared.respond( 'place-token', 'pass' );
                this.shared.showXavier = false;
                this.removeToken();
            }
        }
    }
</script>


<style>

    .place-token-top {
        overflow: hidden;
        transition: all .5s;
    }

    .place-token {
        min-width: 40rem;
    }

    .place-token__button {
        width: 12%
    }

    .place-token-top .tokens-hud__token {
        width: 5.5vw;
        height: 5.5vw;
    }
</style>

