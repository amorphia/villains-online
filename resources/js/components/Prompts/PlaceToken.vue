<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                    <div class="title">Place a token or pass</div>
                    <area-flipper v-if="availableAreas.length" :areas="availableAreas" :index="areaIndex" @update="update">
                        <token-row :area="availableAreas[areaIndex]" effect="placing" :token="token"></token-row>
                    </area-flipper>
                    <div v-else class="view-player__empty center-text">No Area Selected</div>

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
            //this.shared.event.on( 'areaClicked', this.areaClicked );
            this.shared.event.on( 'tokenClicked', this.tokenClicked );
        },

        computed : {
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

            /*
            areaClicked( area ){
                if( this.shared.player.prompt.name !== 'place-token' || area.tokens.length >= area.maxTokens ) return;
                this.areaIndex = _.findIndex( this.availableAreas, item => area.name == item.name );
                this.shared.event.emit('areaSelected', area );
            },
            */

            tokenClicked( token ){
                if( token.location ) return;
                this.token = this.token && this.token.id === token.id  ? null : token;
            },

            placeToken(){
                this.shared.respond( 'place-token', 'place', this.availableAreas[this.areaIndex].name, this.token.id );
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

