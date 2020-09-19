<template>
    <div class="choose-factions d-flex align-stretch height-100">

        <div class="pos-absolute bottom-0 left-0 p-4 highlight">
            <end-game><div class="pointer conclude">conclude game</div></end-game>
        </div>

        <div class="players width-40 height-100 p-5 d-flex flex-center flex-wrap">
            <div class="choose-factions__player-container">
                <div v-for="(player, index) in shared.orderedPlayers()"
                     class="choose-factions__player pull-center d-flex align-stretch"
                     :class="{ active : player.active }">
                    <div class="choose-factions__player-index width-10 p-4" v-text="index + 1"></div>
                    <div class="choose-factions__player-name ellipses width-50 p-4">{{ player.name | startCase }}</div>
                    <div class="choose-factions__player-faction width-40 pos-relative">
                        <div class="loader-bar">
                            <div class="loader-bar__streak"></div>
                        </div>
                        <div class="p-4 choose-factions__text">{{ factionText( player ) }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="factions width-60 height-100 p-5 d-flex align-center">
            <div class="choose-factions__faction-container">
                <div class="choose-factions__faction-list pb-4">
                    <div v-for="(faction, name) in shared.data.factions"
                         :class="{active : selectedFaction === name, taken : faction.owner !== null, killer : faction.killer }"
                         @click="selectedFaction = name"
                         class="choose-factions__faction pointer d-flex justify-end align-center">
                            {{ name }}
                            <span class="choose-factions__circle pl-3" :class="name === selectedFaction ? 'icon-circle' : 'icon-circle-open'"></span>
                    </div>
                </div>
                <div class="d-flex justify-end" :inivisible="!shared.isActive()">
                    <button class="button button-empty"
                            @click="chooseRandomFaction">Random</button>

                    <button :disabled="shared.data.factions[ selectedFaction ] && shared.data.factions[ selectedFaction ].owner !== null"
                            class="button"
                            @click="chooseFaction">Choose</button>
                </div>
            </div>
            <div v-if="selectedFaction" class="choose-factions__faction-sheet"
                 :style="`background-image : url('/images/factions/${selectedFaction}/sheet.jpg')`"
                ></div>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'choose-factions',

        data() {
            return {
                shared : App.state,
                selectedFaction : null,
            };
        },
        mounted(){
            this.selectedFaction = Object.keys( this.shared.data.factions )[0];
        },

        watch : {

        },

        computed : {
            remainingPlayers(){
                return Object.values( this.shared.data.players ).filter( player => !player.faction ).length;
            }
        },

        methods : {
            factionText( player ){
                if( player.active ) return "Choosing..."
                else if( player.faction ) return player.faction;
            },

            chooseRandomFaction(){

                let unselectedFactions = [];
                let killerSelected = false;

                _.forEach( this.shared.data.factions, (faction, name) => {
                   if( faction.killer && faction.owner ) killerSelected = true;
                   else if ( !faction.owner ) unselectedFactions.push( { name : name, killer : faction.killer } );
                });

                if( !killerSelected && this.remainingPlayers === 1 ){
                    unselectedFactions = unselectedFactions.filter( faction => faction.killer );
                }

                this.selectedFaction = _.sample( unselectedFactions ).name;

                this.chooseFaction();
            },

            chooseFaction(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'chooseFaction', this.shared.data.id, this.selectedFaction );
            }
        }
    }
</script>


<style>
    .choose-factions__faction.killer:before {
        content: "";
        background-image: url("/images/icons/killer.png");
        height: 1em;
        background-repeat: no-repeat;
        background-position: center;
        width: 5em;
        margin-right: .2em;
        background-size: contain;
    }

</style>

