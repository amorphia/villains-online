<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <div class="title flex-center"><img v-if="currentOwner" class="determine-control__faction-icon" :src="factionIcon( currentOwner )">{{ message }}</div>

                <div v-if="currentAreaData.capture" class="d-flex align-center primary-light determine-control__capture-container">
                    The {{ currentAreaData.newController }} captured a control marker, gaining <img class="determine-control__ap-icon" :src="`/images/icons/ap-${currentAreaData.capture.ap}.png`">
                </div>

                <div v-if="currentAreaData.capitolToken" class="d-flex align-center primary-light determine-control__capture-container">
                    The {{ currentAreaData.newController }} collects this turn's Capitol Token, gaining <img class="determine-control__ap-icon" :src="`/images/icons/ap-${currentAreaData.capitolToken.ap}.png`">
                </div>

                <div class="my-4">
                    <area-flipper :areas="[currentAreaData]" index="0" noZoom="true">
                        <div class="d-flex flex-column justify-center align-center pb-4">
                            <div class="determine-control__area-influence">
                                <div v-for="faction in currentAreaInfluences" class="determine-control__faction-influence">
                                    <img class="determine-control__small-icon" src="/images/icons/influence.png">
                                    <div class="determine-control__influence">{{ faction.influence }}</div>
                                    <img class="determine-control__small-icon" :src="factionIcon( faction.faction )">
                                </div>
                                <div v-if="!currentAreaInfluences.length" class="determine-control__faction-influence">
                                    <span class="determine-control__no-influence">No factions with influence in this area</span>
                                </div>
                            </div>
                        </div>
                    </area-flipper>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'determine-control',
        data() {
            return {
                shared : App.state,
                index : 0,
                interval : null,
            };
        },

        mounted() {
            this.interval = setInterval( this.incrementIndex, this.data.slideSpeed * 1000 );
            this.checkForAPSound();
        },

        methods : {

            checkForAPSound(){
                if( this.currentAreaData.capture || this.currentAreaData.capitolToken ){
                    App.event.emit( 'sound', 'points' );
                } else {
                    App.event.emit( 'sound', 'chirp' );
                }
            },

            factionIcon( factionName ){
                return _.factionIcon( factionName );
            },

            incrementIndex(){
                if( !this.data || this.index === 8 ){
                    clearInterval( this.interval );
                    return;
                }

                this.index++;
                this.checkForAPSound();
            }
        },

        computed : {

            currentOwner(){
                return this.currentAreaData.newController ? this.currentAreaData.newController : false;
            },

            message(){
                let data = this.currentAreaData;

                if( data.oldController === data.newController || !data.newController && data.oldController ) return `The ${data.oldController} retain the ${this.currentAreaData.name}`;
                if( !data.newController ) return `The ${data.name} remains uncontrolled`;
                if( !data.oldController ) return `The ${data.newController} take the ${this.currentAreaData.name}`;
                return `The ${data.newController} take the ${this.currentAreaData.name} from the ${data.oldController}`;

            },

            area(){
                return this.shared.data.areas[ this.currentArea ];
            },

            currentAreaInfluences(){
                return this.currentAreaData.influences.sort( (a,b) => b.influence - a.influence );
            },

            currentAreaName(){
                return this.currentAreaData.name;
            },

            currentAreaData(){
                return this.data.areas[this.index];
            },

            areas(){
                let areas = [];
                this.data.areas.forEach( areaName => { areas.push( this.shared.data.areas[areaName] )});
                return areas;
            },

            data(){
                return this.shared.player.prompt.data;
            },

        },


    }
</script>


<style>

    .determine-control__faction-icon {
        width: 2em;
        border: 1px solid;
        box-shadow: 0 0 3px rgba(0,0,0,1), 0 0 4px 2px rgba(0,0,0,.5);
        margin-right: .5rem;
        margin-bottom: .25rem;
    }

    .determine-control__influence {
        margin: 0 .5rem 0 .3rem;
    }

    .determine-control__no-influence {
        font-size: 1.5rem;
    }

    .determine-control__faction-influence {
        display: flex;
        padding: .1rem .75rem;
        background-color: rgba(0,0,0,.8);
        font-size: 2rem;
        align-items: center;
        justify-content: center;
        color: var(--highlight-color);
    }

    .determine-control__small-icon {
        width: 1.75rem;
    }

    .determine-control__capture-container {
        font-size: 1.5rem;
    }

    .determine-control__ap-icon {
        width: 3rem;
        margin-left: .5rem;
    }

</style>

