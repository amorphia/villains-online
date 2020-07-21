<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                    <div class="title">Place a token or pass</div>

                    <div v-if="canXavier && areaIndex === -1" class="d-flex justify-center">
                        <button v-if="availableAreas.length > 0" class="flipper" @click="areaIndex = availableAreas.length - 1"><i class="icon-left"></i></button>
                        <area-flipper :areas="[xavierArea]" index="0">
                            <unit-row :units="[xavier]"></unit-row>
                        </area-flipper>
                        <button v-if="availableAreas.length > 0" class="flipper" @click="areaIndex = 0"><i class="icon-right"></i></button>
                    </div>

                    <area-flipper v-else-if="availableAreas.length > 0 && areaIndex !== -1"
                                  :areas="availableAreas"
                                  :index="areaIndex"
                                  :hasReserves="canXavier"
                                  @update="update">
                        <token-row :area="availableAreas[areaIndex]" effect="placing" @token="tokenClicked" :token="token"></token-row>
                    </area-flipper>
                    <div v-else class="view-player__empty center-text">No Area Selected</div>

                <div v-if="canXavier" class="options center-text">
                    <button class="button button-empty"
                            :class="{ active: areaIndex === -1 }"
                            @click="areaIndex = -1">
                        XAVIER
                    </button>

                    <button class="button button-empty"
                            :class="{ active: areaIndex !== -1 }"
                            @click="areaIndex = 0">
                        AREAS
                    </button>
                </div>

                <div class="place-token__tokens mt-4">
                    <token-set :tokens="reserves" classes="one-line" :selected="token"></token-set>
                </div>

                <div class="">
                    <button class="button button-empty" @click="passToken">PASS</button>
                    <button class="button" @click="placeToken" :disabled="saveDisabled">SAVE</button>
                </div>
            </div>
        </div>
    </player-prompt>
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
          'shared.data.playerAction'(){
              this.reset();
          }
        },

        mounted(){
            this.shared.event.on( 'tokenClicked', this.tokenClicked );
        },

        computed : {

            xavier(){
                if( this.shared.faction.name !== 'society' ) return;
                let xavier = this.shared.faction.units.find( unit => unit.type === 'champion' );
                if( this.token && this.areaIndex === -1 ) {
                    this.$set( xavier, 'placeToken', this.token );
                } else {
                    this.$set( xavier, 'placeToken', null );
                }
                return xavier;
            },

            xavierArea(){
                if( this.shared.faction.name !== 'society' ) return;
                return this.shared.data.areas[ this.xavier.location ];
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

            update( n ){

                this.areaIndex = n;
            },

            reset(){
                this.token = null;
            },

            removeToken( token ){
                if( !this.token || this.token.id !== token.id ) return;
                this.token = null;
            },

            tokenClicked( token ){
                console.log( 'token clicked', token );
                if( token.location ) return;
                this.token = this.token && this.token.id === token.id  ? null : token;
            },

            placeToken(){
                let areaName = this.areaIndex === -1 ? 'xavier' : this.availableAreas[this.areaIndex].name;
                this.shared.respond( 'place-token', 'place', areaName, this.token.id );
            },

            passToken(){
                this.shared.respond( 'place-token', 'pass' );
            }
        }
    }
</script>


<style>

    .place-token{
        min-width: 40rem;
    }


</style>

