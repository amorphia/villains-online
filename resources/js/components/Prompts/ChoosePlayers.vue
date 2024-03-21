<template>
    <player-prompt classes="">
        <div class="choose-spy overflow-auto px-5">
            <!-- title -->
            <div class="title view-player__title">{{ message }}</div>

            <!-- player display -->
            <div class="d-flex justify-center">
                <div class="choose-factions__player-container">

                    <!-- faction -->
                    <div v-for="faction in data.factions"
                         class="choose-factions__player pull-center d-flex align-stretch"
                         @click="playerClicked( faction )"
                         :class="{ active : selected.includes( faction ) }">

                        <!-- icon -->
                        <div class="choose-factions__player-faction width-15 d-flex pr-2">
                            <img class="choose-spy__champion" :src="`/images/factions/${faction}/icon.jpg`" >
                        </div>

                        <!-- name -->
                        <div class="choose-factions__player-name ellipses width-60 p-4">{{ faction | startCase }}</div>

                        <!-- checkbox -->
                        <div class="choose-spy__checkbox width-25 choose-factions__player-faction d-flex align-center justify-center">
                            <i :class="selected.includes( faction ) ? 'icon-checkbox-checked' : 'icon-checkbox-unchecked'"></i>
                        </div>
                    </div>

                </div>
            </div>

            <!-- submit button -->
            <div class="width-100 d-flex justify-center">
                <button v-if="data.canDecline" class="button button-empty" @click="resolve( false )">Decline</button>
                <button class="button" :disabled="!canSubmit" @click="resolve( true )">Save Choices</button>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-players',

        data() {
            return {
                shared : App.state,
                selected : []
            };
        },

        computed : {

            /**
             * Can we submit our choice?
             * @returns {boolean}
             */
            canSubmit(){
                return ( this.selected.length && !this.data.count ) || this.selected.length === this.data.count;
            },


            /**
             * Return prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },


            /**
             * Get title message
             * @returns {string}
             */
            message(){
                return this.data.message ? this.data.message : "select players";
            }
        },

        methods : {

            /**
             * Handle clicking on a player
             * @param faction
             */
            playerClicked( faction ){

                // unselect a faction if it was already selected
                if( this.selected.includes( faction ) ){
                    this.selected = this.selected.filter( fac => fac !== faction );
                    return;
                }

                if( this.selected.length >= this.data.count ) {
                    return App.event.emit( 'sound', 'error' );
                }

                // otherwise select it
                this.selected.push( faction );
            },


            /**
             * Resolve this prompt
             * @param action
             */
            resolve( action ){
                let data = this.getResolveData( action );
                data = { ...this.data, ...data };
                this.shared.respond( 'choose-players', data );
            },


            /**
             * Get our resolution data
             *
             * @param action
             * @returns {object}
             */
            getResolveData( action ){
                // return our selected factions if we didn't decline
                if( action === true ) return { factions : this.selected };

                // if we declined...
                return {
                    factions : [],
                    decline : true
                }
            },
        }
    }
</script>


<style>
 .choose-spy__champion{
     width: 100%;
 }

    .choose-spy .icon-checkbox-unchecked {
        color: var(--primary-light-color );
    }

 .choose-spy .icon-checkbox-checked {
     color: var(--highlight-color );
 }
</style>

