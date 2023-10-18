<template>
    <player-prompt classes="">
        <div class="place-token px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <!-- title -->
                <div class="title flex-center"><img v-if="currentOwner" class="determine-control__faction-icon" :src="shared.factionIcon( currentOwner )">{{ message }}</div>

                <!-- captured area info -->
                <div v-if="currentAreaData.capture" class="d-flex align-center primary-light determine-control__capture-container">
                    The {{ currentAreaData.newController }} captured a control marker, gaining <img class="determine-control__ap-icon" :src="`/images/icons/ap-${currentAreaData.capture.ap}.png`">
                </div>

                <!-- capitol token -->
                <div v-if="currentAreaData.capitolToken" class="d-flex align-center primary-light determine-control__capture-container">
                    The {{ currentAreaData.newController }} collects this turn's Capitol Token, gaining <img class="determine-control__ap-icon" :src="`/images/icons/ap-${currentAreaData.capitolToken.ap}.png`">
                </div>

                <div class="my-4">
                    <!-- area -->
                    <area-flipper :areas="[currentAreaData]" index="0" noZoom="true">
                        <div class="d-flex flex-column justify-center align-center pb-4">
                            <!--influence -->
                            <div class="determine-control__area-influence">
                                <!-- faction influences -->
                                <div v-for="faction in currentAreaInfluences" class="determine-control__faction-influence">
                                    <img class="determine-control__small-icon" src="/images/icons/influence.png">
                                    <div class="determine-control__influence">{{ faction.influence }}</div>
                                    <img class="determine-control__small-icon" :src="shared.factionIcon( faction.faction )">
                                </div>
                                <!-- no influence -->
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
                index : 0, // area index
                interval : null,
            };
        },

        mounted() {
            // set interval
            this.interval = setInterval( this.incrementIndex, this.data.slideSpeed * 1000 );
            this.checkForAPSound();
        },

        methods : {

            /**
             * Choose what sound to play
             */
            checkForAPSound(){
                // if points were scored play the points sound
                if( this.currentAreaData.capture || this.currentAreaData.capitolToken ){
                    App.event.emit( 'sound', 'points' );
                    return;
                }

                // otherwise just play the usual chirp
                App.event.emit( 'sound', 'chirp' );
            },


            /**
             * Has this area been retained?
             * @returns {boolean}
             */
            isRetained( data ){
                return ( data.oldController && data.oldController === data.newController )
                    || !data.newController && data.oldController;
            },

            /**
             * Increment our area
             */
            incrementIndex(){
                // clear our interval when done
                if( !this.data || this.index === 8 ){
                    clearInterval( this.interval );
                    return;
                }

                // increment our index
                this.index++;
                this.checkForAPSound();
            }
        },

        computed : {
            /**
             * Return the name of current area's owner
             * @returns {string|false}
             */
            currentOwner(){
                return this.currentAreaData.newController ? this.currentAreaData.newController : false;
            },


            /**
             * Return our results message
             * @returns {string}
             */
            message(){
                let data = this.currentAreaData;

                // if the area was retained
                if( this.isRetained( data ) ) return `The ${data.oldController} retain the ${this.currentAreaData.name}`;

                // if the area has gone uncontrolled
                if( !data.newController ) return `The ${data.name} remains uncontrolled`;

                // if this area was not previously controlled
                if( !data.oldController ) return `The ${data.newController} take the ${this.currentAreaData.name}`;

                // otherwise the area must have been taken by one player from another player
                return `The ${data.newController} take the ${this.currentAreaData.name} from the ${data.oldController}`;
            },


            /**
             * Return the current area object
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[ this.currentArea ];
            },


            /**
             * Sort the area's faction influence
             * @returns {object[]}
             */
            currentAreaInfluences(){
                return this.currentAreaData.influences.sort( (a,b) => b.influence - a.influence );
            },


            /**
             * Return the current area's name
             * @returns {string}
             */
            currentAreaName(){
                return this.currentAreaData.name;
            },


            /**
             * Returns the current area object
             * @returns {Area}
             */
            currentAreaData(){
                return this.data.areas[this.index];
            },


            /**
             * Return an array of the area Objects
             */
            areas(){
                this.data.areas.map( areaName => this.shared.data.areas[areaName] );
            },


            /**
             * Return the prompt data
             * @returns {object}
             */
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
