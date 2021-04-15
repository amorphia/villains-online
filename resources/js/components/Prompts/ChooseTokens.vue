<template>
    <player-prompt>
        <div class="min-prompt-width px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <!-- title -->
                <div class="title">{{ message }}</div>

                <!-- area -->
                <area-flipper v-if="areas.length" :areas="areas" :index="index" @update="updateArea">
                    <div class="toggle area-map__toggle top-0 left-0">Selected: {{ selected.length }} / {{ data.count }}</div>
                    <token-row :area="area" effect="selecting" @token="tokenClicked"></token-row>
                </area-flipper>

                <!-- submit buttons -->
                <div>
                    <button v-if="data.optional" class="button button-empty" @click="resolve">DECLINE</button>
                    <button class="button" @click="resolve" :disabled="!canSubmit">SAVE</button>
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

            /**
             * Can we submit our choices
             * @returns {boolean}
             */
            canSubmit(){
                return this.needToSelect === 0 || this.data.optional;
            },


            /**
             * Return our title message
             * @returns {string}
             */
            message(){
                // if we were given a message use it
                if( this.data.message ) return this.data.message;

                // otherwise build up a message from our options
                let message = [];
                message.push( `Choose ${ this.data.count }` );
                if( this.data.revealedOnly ) message.push( 'revealed' );
                if( this.data.unrevealedOnly ) message.push( 'unrevealed' );
                if( this.data.enemyOnly ) message.push( 'enemy' );
                this.data.count  > 1 ? message.push( `tokens` ) : message.push( 'token' );
                return message.join( ' ' );
            },


            /**
             * Returns our current area object
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[ this.currentAreaName ];
            },


            /**
             * Returns our current area name
             * @returns {string}
             */
            currentAreaName(){
                return this.data.areas[this.index];
            },


            /**
             * Return an array of our area objects
             * @returns {Area[]}
             */
            areas(){
                return this.data.areas.map( areaName => this.shared.data.areas[areaName] );
            },


            /**
             * Return the number of tokens we still need to select
             * @returns {number}
             */
            needToSelect(){
                return this.data.count - this.selected.length;
            },


            /**
             * Return our selected tokens
             * @returns {Token[]}
             */
            selected(){
                return this.area.tokens.filter( token => token.selected );
            },


            /**
             * Return our prompt data
             * @returns {null}
             */
            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            /**
             * Resolve this prompt
             */
            resolve(){
                let data = {};
                if( this.selected.length ) data.tokens = _.map( this.selected, 'id' );
                data = { ...data, ...this.data};

                this.shared.respond( 'choose-tokens', data );
            },


            /**
             * Update our current area
             * @param index
             */
            updateArea( index ){
                if( index === this.index ) return;
                this.area.tokens.forEach( token => this.$set( token, 'selected', false ) );
                this.index = index;
            },



            /**
             * Handle a clicked token
             * @param token
             */
            tokenClicked( token ){

                // if we can't select this token, abort
                if( !this.canSelectToken( token ) ) return;

                // unselect this token if it was already selected
                if( token.selected ){
                    this.$set( token, 'selected', false );
                    return;
                }

                // if we can't select any more tokens, and our token count is greater than 1 abort
                if( this.needToSelect === 0 && this.data.count > 1 ) return;

                // if we can't select any more tokens, any only need to select 1 total token
                // unselect all other tokens before selecting this one
                if( this.needToSelect === 0 ) {
                    this.area.tokens.forEach( token => this.$set( token, 'selected', false ) );
                }

                // select our token
                this.$set( token, 'selected', true );
            },


            /**
             * Can we select this token?
             *
             * @param token
             * @returns {boolean}
             */
            canSelectToken( token ){
                return !(token.location !== this.area.name // check token area
                    || (this.data.unrevealedOnly && token.revealed) // check unrevealed only
                    || (this.data.revealedOnly && !token.revealed) // check revealed only
                    || (this.data.enemyOnly && token.faction === this.shared.faction.name) // check enemy only
                    || (this.data.playerOnly && token.faction !== this.shared.faction.name) ); // check player only
            },

        }
    }
</script>


