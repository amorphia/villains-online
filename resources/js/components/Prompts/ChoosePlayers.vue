<template>
    <player-prompt classes="">
        <div class="choose-spy overflow-auto px-5">
            <div class="title view-player__title">{{ message }}</div>
            <div class="d-flex justify-center">
                <div class="choose-factions__player-container">
                    <div v-for="faction in data.factions"
                         class="choose-factions__player pull-center d-flex align-stretch"
                         @click="playerClicked( faction )"
                         :class="{ active : selected.includes( faction ) }">

                        <div class="choose-factions__player-faction width-15 d-flex pr-2">
                            <img class="choose-spy__champion" :src="`/images/factions/${faction}/portrait.png`" >
                        </div>

                        <div class="choose-factions__player-name ellipses width-60 p-4">{{ faction | startCase }}</div>

                        <div class="choose-spy__checkbox width-25 choose-factions__player-faction d-flex align-center justify-center">
                            <i :class="selected.includes( faction ) ? 'icon-checkbox-checked' : 'icon-checkbox-unchecked'"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="width-100 d-flex justify-center">
                <button v-if="data.canDecline" class="button button-empty" @click="resolve( false )">Decline</button>
                <button class="button" :disabled="!canSubmit" @click="resolve( true )">Save Choices</button>
            </div>
        </div>}
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

            canSubmit(){
                return ( this.selected.length && !this.data.count ) || this.selected.length === this.data.count;
            },

            data(){
                return this.shared.player.prompt.data;
            },

            message(){
                return this.data.message ? this.data.message : "select players";
            }
        },

        methods : {

            playerClicked( faction ){
                if( this.selected.includes( faction ) ){
                    this.selected = this.selected.filter( fac => fac !== faction );
                } else {
                    this.selected.push( faction );
                }
            },

            resolve( action ){
                let data = {};

                if( action ){
                    data.factions = this.selected;
                } else {
                    data.decline = true;
                }

                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'choose-players', data );
            }
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

