<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title">{{ message }}</div>
                <area-flipper v-if="areas.length" :areas="areas" :index="index" @update="updateArea">
                    <div class="toggle area-map__toggle top-0 left-0">Selected: {{ selected.length }} / {{ data.count }}</div>
                    <token-row :area="area" effect="selecting" @token="tokenClicked"></token-row>
                </area-flipper>

                <div class="">
                    <button class="button" @click="resolve" :disabled="needToSelect > 0">SAVE</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-tokens',
        data() {
            return {
                shared : App.state,
                index : 0,
            };
        },

        computed : {

            message(){
                let message = [];
                message.push( `Choose ${ this.data.count }` );
                //if( this.data.playerOnly ) message.push( 'of your' );
                if( this.data.revealedOnly ) message.push( 'revealed' );
                if( this.data.unrevealedOnly ) message.push( 'unrevealed' );
                if( this.data.enemyOnly ) message.push( 'enemy' );
                this.data.count  > 1 ? message.push( `tokens` ) : message.push( 'token' );
                return message.join( ' ' );
            },

            area(){
                return this.shared.data.areas[ this.currentArea ];
            },

            currentArea(){
                return this.data.areas[this.index];
            },

            areas(){
                let areas = [];
                this.data.areas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },

            needToSelect(){
                return this.data.count - this.selected.length;
            },

            selected(){
                return this.area.tokens.filter( token => token.selected );
            },

            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {
            resolve(){
                let data = {};
                data.tokens = _.map( this.selected, 'id' );
                data = Object.assign( {}, this.data, data );

                this.shared.respond( 'choose-tokens', data );
            },

            updateArea( n ){
                if( n === this.index ) return;
                this.area.tokens.forEach( token => this.$set( token, 'selected', false ) );
                this.index = n;
            },


            tokenClicked( token ){

                if( token.location !== this.area.name
                    || ( this.data.unrevealedOnly && token.revealed )
                    || ( this.data.revealedOnly && !token.revealed )
                    || ( this.data.enemyOnly && token.faction === this.shared.faction.name )
                    || ( this.data.playerOnly && token.faction !== this.shared.faction.name )
                ) {
                    return;
                }

                if( token.selected ){
                    this.$set( token, 'selected', false );
                } else {
                    if( this.needToSelect === 0 ) {
                        if( this.data.count > 1) {
                            return;
                        }

                        this.area.tokens.forEach( token => this.$set( token, 'selected', false ) );
                    }
                    this.$set( token, 'selected', true );
                }
            },
        }
    }
</script>


<style>

    .place-token{
        min-width: 40rem;
    }


</style>

