<template>
    <div class="choose-factions d-flex align-stretch height-100">

        <!-- title -->
        <div class="pos-absolute bottom-0 left-0 p-4 highlight">
            <end-game><div class="pointer conclude">conclude game</div></end-game>
        </div>

        <!-- players -->
        <div class="players width-35 height-100 p-5 d-flex flex-center flex-wrap">

            <!-- ignored areas -->
            <div v-if="shared.data.ignoredAreas.length" class="choose-factions__player-container">
                <div v-for="(area, index) in shared.data.ignoredAreas"
                     class="choose-factions__player pull-center d-flex align-stretch">
                    <div class="choose-factions__area-index bold width-10 p-4">X</div>
                    <div class="choose-factions__player-name ellipses width-50 p-4">{{ area }}</div>
                </div>
            </div>

            <!-- players -->
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

            <!-- buttons -->
            <div class="d-flex justify-end" :inivisible="!shared.isActive()">
                <button :disabled="!canRandom" class="button button-empty"
                        @click="chooseRandomFaction">Random</button>

                <button :disabled="!selectedFaction || !shared.data.factions[ selectedFaction ].selectable"
                        class="button"
                        @click="chooseFaction">Choose</button>
            </div>
        </div>

        <!-- factions -->
        <div class="factions width-65 height-100 p-5 d-flex align-center">
            <div class="choose-factions__faction-container">
                <div class="choose-factions__faction-list pb-3 pr-3 overflow-auto">

                    <!-- basic factions -->
                    <div class="choose-factions__basic-factions pr-3">
                        <faction-choice
                            v-for="faction in basicFactions"
                            @clicked="e => selectedFaction = e"
                            @blocked="blockFaction"
                            :faction="faction"
                            :selected="selectedFaction"
                            :factionOptions="factionOptions"
                            :key="faction.name"
                            @isSelectable="e => setIsSelectable( faction, e )"
                            :remainingPlayers="remainingPlayers"
                            :killersSelected="killersSelected"
                            :expansionsSelected="expansionsSelected"
                        ></faction-choice>
                    </div>

                    <!-- expansion factions -->
                    <div class="choose-factions__expansion-factions pr-3">
                        <faction-choice
                            v-for="faction in expansionFactions"
                            @clicked="e => selectedFaction = e"
                            @blocked="blockFaction"
                            :faction="faction"
                            :selected="selectedFaction"
                            :factionOptions="factionOptions"
                            :key="faction.name"
                            @isSelectable="e => setIsSelectable( faction, e )"
                            :remainingPlayers="remainingPlayers"
                            :killersSelected="killersSelected"
                            :expansionsSelected="expansionsSelected"
                        ></faction-choice>
                    </div>
                </div>

            </div>

            <!-- faction sheet -->
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
                random: false,
                selectedFaction : null,
            };
        },

        mounted(){
            // set our initial faction
            this.selectedFaction = this.basicFactions[0].name;
        },


        computed : {

            /**
             * Return an array of our basic factions
             * @returns {faction[]}
             */
            basicFactions(){
                return Object.values( this.shared.data.factions )
                        .filter( faction => faction.basic )
                        .sort( this.sortFactions );
            },

            factionOptions(){
                if(this.shared.data.gameType !== 'secret') return [];
                return this.shared.data.factionOptions[this.shared.player.id];
            },

            /**
             * Return an array of our expansion factions
             * @returns {faction[]}
             */
            expansionFactions(){
                return Object.values( this.shared.data.factions )
                        .filter( faction => !faction.basic )
                        .sort( this.sortFactions );
            },


            /**
             * How many players remain to pick?
             * @returns {number}
             */
            remainingPlayers(){
                return Object.values( this.shared.data.players )
                    .filter( player => !player.faction )
                    .length;
            },


            /**
             * How many killer factions have been selected
             * @returns {number}
             */
            killersSelected(){
                return Object.values( this.shared.data.factions )
                    .filter( faction => faction.killer && faction.owner )
                    .length;
            },


            /**
             * How many expansion factions have been selected
             * @returns {number}
             */
            expansionsSelected(){
                return Object.values( this.shared.data.factions )
                    .filter( faction => !faction.basic && faction.owner )
                    .length;
            },


            /**
             * How many experimental factions have been selected
             * @returns {number}
             */
            experimentalsSelected(){
                return Object.values( this.shared.data.factions )
                    .filter( faction => faction.status === 0 && faction.owner )
                    .length;
            },


            /**
             * Can we select a random faction?
             * @returns {boolean}
             */
            canRandom(){
                return this.shared.isActive()
                    && !! Object.values( this.shared.data.factions ).find( faction => faction.selectable );
            }

        },

        methods : {

            /**
             * Sort our factions
             * @param a
             * @param b
             * @returns {number}
             */
            sortFactions( a ,b ){
                // selectable first
                if( a.unselectable ) return 1;
                if( b.unselectable ) return -1;

                // status second
                if( a.status > b.status ) return -1;
                if( a.status < b.status ) return 1;

                // alphabetically third
                if( a.name > b.name ) return 1;
                if( a.name < b.name ) return -1;
            },


            /**
             * Return the given player's title text
             * @param player
             * @returns {string|*}
             */
            factionText( player ){
                if( player.active ) return "Choosing...";
                if( player.faction && this.shared.data.gameType === 'secret' ) return "Faction Chosen";
                if( player.faction ) return player.faction;
            },


            /**
             * Choose a random faction
             */
            chooseRandomFaction(){
                let unselectedFactions;
                this.random = true;

                if(this.shared.data.gameType === 'secret'){
                    unselectedFactions = Object.values( this.shared.data.factions ).filter( faction => {
                        return faction.selectable && this.factionOptions.includes( faction.name );
                    });

                    this.selectedFaction = _.sample( unselectedFactions ).name;
                } else {
                    unselectedFactions = Object.values( this.shared.data.factions )
                        .filter( faction => faction.selectable === true );
                    this.selectedFaction = _.sample( unselectedFactions ).name;
                }

                this.chooseFaction();
            },


            /**
             * Toggle blocking the given faction from being selected randomly
             * @param factionName
             */
            blockFaction( factionName ){
                let faction = Object.values( this.shared.data.factions )
                    .find( item => item.name === factionName );

                faction.blocked = !faction.blocked;
                if( !faction.blocked ) faction.selectable = true;
            },


            /**
             * Set a faction's selectability
             * @param faction
             * @param val
             */
            setIsSelectable( faction, val ){
                faction.selectable = val;
            },


            /**
             * Save our faction choice
             */
            chooseFaction(){
                App.event.emit( 'sound', 'ui' );
                this.shared.socket.emit( 'chooseFaction', this.shared.data.id, this.selectedFaction, this.random );
            }
        }
    }
</script>


<style>
    .choose-factions__faction.killer:before {
        content: "";
        background-image: url("/images/icons/killer-square.png");
        height: 1em;
        background-repeat: no-repeat;
        background-position: center;
        width: 1em;
        position: relative;
        bottom: 1px;
        margin-right: .4em;
        background-size: contain;
    }


    .choose-factions__basic-factions {
        border-right: 2px solid #ffa70080;
    }

    .choose-factions__expansion-factions {
        border-right: 2px dotted #ffa70080;
    }

    .choose-factions__status {
        width: .5em;
        height: .5em;
        border-radius: .1em;
        margin-left: .1em;
    }

    .choose-factions__status-0 { background-color: red; }
    .choose-factions__status-1 { background-color: #ff8800; }
    .choose-factions__status-2 { background-color: #a7cc00; }
    .choose-factions__status-3 { background-color: green; }

    .choose-factions__faction-list {
        max-height: 95vh;
    }

</style>

