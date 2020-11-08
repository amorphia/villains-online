<template>
    <transition name="right">
        <div v-if="open" class="view-player pos-absolute width-100 height-100 top-0 p-5 d-flex align-stretch overflow-auto z-5">
            <button class="toggle fixed top right icon-x" @click="open = false"></button>

            <div class="factions width-100 height-100 p-5 d-flex align-center">
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
                <div v-if="selectedFaction" class="choose-factions__faction-sheet"
                     :style="`background-image : url('/images/factions/${selectedFaction}/sheet.jpg')`"
                ></div>
            </div>

        </div>
    </transition>
</template>


<script>
    export default {

        name: 'view-factions',

        data() {
            return {
                shared : App.state,
                open : false,
                selectedFaction : null,
            };
        },

        mounted(){

        },

        created(){
            this.shared.event.on( 'viewFactions', e => {
                this.open = true;
                this.selectedFaction = this.factions[0].name;
            });
        },

        computed : {
            factions(){
                return Object.values( this.shared.factionList ).sort( this.sortFactions );
            },
        },

        watch : {
            open(){
                App.event.emit( 'sound', 'ui' );
            },
        },

        methods : {
            sortFactions( a ,b ){
                if( a.basic && !b.basic ) return -1;
                if( b.basic && !a.basic ) return 1;
                if( !a.selectable ) return 1;
                if( !b.selectable ) return -1;
                if( a.status > b.status ) return -1;
                if( a.status < b.status ) return 1;
                if( a.name > b.name ) return 1;
                if( a.name < b.name ) return -1;
            },
        }
    }
</script>


<style>


</style>

