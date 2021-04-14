<template>
    <transition name="right">
        <div v-if="open" class="view-player pos-absolute width-100 height-100 top-0 p-5 d-flex align-stretch overflow-auto z-5">

            <!-- close button -->
            <button class="toggle fixed top right icon-x" @click="open = false"></button>


            <div class="factions width-100 height-100 p-5 d-flex align-center">

                <!-- factions list -->
                <div class="choose-factions__faction-container">
                    <div class="choose-factions__faction-list pb-3">

                        <div class="choose-factions__basic-factions pr-3">
                            <faction-choice
                                v-for="faction in factions"
                                @clicked="e => selectedFaction = e"
                                :faction="faction"
                                :selected="selectedFaction"
                                :key="faction.name"
                            ></faction-choice>
                        </div>
                    </div>

                </div>

                <!-- selected faction sheet -->
                <div v-if="selectedFaction" class="choose-factions__faction-sheet"
                     :style="`background-image : url('/images/factions/${selectedFaction}/sheet.jpg')`"
                ></div>
            </div>

        </div>
    </transition>
</template>


<script>
    import factionList from "../../../../server/classes/data/factionList.js";

    export default {

        name: 'view-factions',

        data() {
            return {
                shared : App.state,
                open : false,
                factionList : factionList,
                selectedFaction : null,
            };
        },

        created(){

            // set event listener to open panel
            this.shared.event.on( 'viewFactions', () => {
                this.open = true;
                this.selectedFaction = this.factions[0].name;
            });
        },

        computed : {
            /**
             * Return our sorted faction list
             * @returns {object[]}
             */
            factions(){
                return Object.values( this.factionList ).sort( this.sortFactions );
            },
        },

        watch : {
            open(){
                App.event.emit( 'sound', 'ui' );
            },
        },

        methods : {
            /**
             * Sort our factions
             *
             * @param a
             * @param b
             * @returns {number}
             */
            sortFactions( a ,b ){
                // basic factions go first
                if( a.basic && !b.basic ) return -1;
                if( b.basic && !a.basic ) return 1;

                // then selectable factions before unselectable
                if( !a.selectable ) return 1;
                if( !b.selectable ) return -1;

                // higher status before lower status
                if( a.status > b.status ) return -1;
                if( a.status < b.status ) return 1;

                // finally sort alphabetically
                if( a.name > b.name ) return 1;
                if( a.name < b.name ) return -1;
            },
        }
    }
</script>


<style>


</style>

