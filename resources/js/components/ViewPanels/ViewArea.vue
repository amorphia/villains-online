<template>
<transition name="right">
    <div v-if="area" class="view-area pos-absolute width-100 height-100 p-5 top-0 overflow-auto z-4">

        <!-- close button -->
        <button class="toggle fixed top right icon-x"
                @click="closeViewArea"
        ></button>

        <div class="d-flex align-stretch">

            <!-- area details -->
            <div class="view-area__main-content width-40 pt-4 pr-5 pb-6">

                <!-- owner -->
                <div v-if="area.owner" class="title d-flex align-center view-area__controller">
                    <img class="determine-control__faction-icon" :src="shared.factionIcon( area.owner )">
                    Controlled by The {{ area.owner | startCase }}
                </div>

                <!-- exterminated -->
                <div v-if="exterminated" class="title d-flex align-center view-area__controller">
                    <img class="determine-control__faction-icon" :src="shared.factionIcon( exterminated )">
                    Exterminated by The {{ exterminated | startCase }}
                </div>

                <!-- control ability -->
                <div class="view-player__title">Control Ability</div>
                <div class="p-3 primary-light" v-html="shared.filterText( area.control )"></div>

                <!-- skill ability -->
                <div class="view-player__title">Skill Ability</div>
                <div class="p-3 primary-light" v-html="shared.filterText( area.skill )"></div>

                <!-- faction influence -->
                <div class="view-player__title">Influence</div>
                <div class="view-area__influence-container">
                    <div v-for="influence in influences" class="d-flex view-area__influence player-hud">
                        <div class="influence-marker mb-2"><img src="/images/icons/influence.png"></div>
                        <div class="view-area__influence-count">{{ influence.influence }}{{ influence.faction === 'plants' && killedPlant ? '*' : '' }}</div>
                        <img class="determine-control__faction-icon" :src="shared.factionIcon( influence.faction )">
                        <span>The {{ influence.faction | startCase }}</span>
                    </div>
                </div>

                <!-- active cards -->
                <div class="view-player__title">Active Cards:</div>
                <div v-if="area.cards.length" class="view-player__active-cards pt-4">
                    <div v-for="card in area.cards" class="pos-relative view-player__card">
                        <img class="z-1 view-player__card pointer"
                             @click="shared.card = `/images/cards/${card.file}.jpg`"
                             :src="`/images/cards/${card.file}.jpg`">
                        <img class="pos-absolute bottom-0 z-2 card-faction-icon" :src="shared.factionIcon( card.owner )">
                    </div>
                </div>
                <div v-else class="view-player__empty">No Active Cards</div>

                <!-- skill ability -->
                <div class="view-player__title">Used Skill Ability:</div>
                <div v-if="usedSkill.length" class="view-player__areas">
                    <div v-for="faction in usedSkill" class="highlight p-3">
                        <img class="determine-control__faction-icon" :src="shared.factionIcon( faction )">
                    </div>
                </div>
                <div v-else class="view-player__empty">No factions have used this skill ability</div>
            </div>

            <!-- components -->
            <div class="view-player__main-content width-60 pt-6 pr-5 pb-3 h-100">

                <div class="p-0 width-100 view-area__area pos-relative" :class="`area-${area.name}`">

                    <!-- tokens -->
                    <div class="view-area__tokens pos-absolute width-100 z-2">
                        <token-row :area="area" :token="token"></token-row>
                    </div>

                    <!-- header -->
                    <div class="view-area__header area-zoom__header p-4 pos-relative grow-0 shrink-0"></div>


                    <div class="view-area__body area-zoom__body p-4 pos-relative grow-1 flex-center flex-column flex-wrap">

                        <!-- default units -->
                        <area-units v-for="faction in shared.data.factions"
                                    :faction="faction"
                                    :key="faction.name"
                                    :area="area.name">
                        </area-units>
                    </div>

                    <!-- ready units -->
                    <div class="view-area__footer area-zoom__footer p-4 pos-relative grow-0 shrink-0 center-text overflow-auto">
                        <area-units v-for="faction in shared.data.factions"
                                    :faction="faction"
                                    :area="area.name"
                                    :key="faction.name"
                                    skilled="true"
                                    classes="d-inline">
                        </area-units>
                    </div>
                </div>

                <!-- dead units -->
                <div v-if="dead" class="view-area__dead">
                    <div v-for="(units,faction) in dead" :key="faction" class="view-area__dead-block">
                        <div class="title d-flex align-center view-area__controller"><img class="determine-control__faction-icon" :src="shared.factionIcon( faction )"> {{ faction }} Kills</div>
                        <unit-row :units="units"></unit-row>
                    </div>
                </div>
            </div>

        </div>

    </div>
</transition>
</template>


<script>
    export default {

        name: 'view-area',
        data() {
            return {
                shared : App.state,
                area : null,
            };
        },

        watch : {
            // make a boop noise when we change areas
            area(){
                App.event.emit( 'sound', 'ui' );
            }
        },

        created(){
            // set event listeners
            this.shared.event.on( 'viewArea', this.setViewArea );
            this.shared.event.on( 'viewPlayer', () => this.area = null );
        },


        computed : {
            /**
             * Return all of the dead units in the area grouped by faction, or false if no dead units
             * @returns {object|false}
             */
            dead(){
                let dead = _.allKilledUnitsInAreaByFaction( this.area.name, this.shared.data.factions );
                return dead ?? false;
            },


            /**
             * Do we have any killed plant units here?
             * @returns {boolean}
             */
            killedPlant(){
                if( !this.shared.data.factions['plants'] ) return;

                return _.factionAreasWithDead( this.shared.data.factions['plants'] ).includes( this.area.name );
            },


            /**
             * Return the number of webbed units here
             * @returns {boolean|number}

            webbedCount(){
                if( ! this.shared.data.factions['spiders'] ) return false;
                return _.webbedUnits( this.shared.data.factions['spiders'], { area : this.area.name } ).length;
            },
             */

            /**
             * Returned the webbed units in this area, or false if none
             * @returns {object|false}

            webbed(){
                if( ! this.shared.data.factions['spiders'] ) return false;

                let webbed = {};
                // get each faction's webbed units
                _.forEach( this.shared.data.factions, faction => {
                    let units = _.webbedUnits( this.shared.data.factions['spiders'], { faction : faction.name, area : this.area.name } );
                    if( units.length ) webbed[faction.name] = units;
                });

                return Object.keys( webbed ).length ? webbed : false;
            },
             */

            /**
             * Do we have a token selected in our shared state that is in this area? If so return it.
             * @returns {*}
             */
            token(){
                if( this.shared.token && this.shared.token.place === this.area.name ){
                    return this.shared.token;
                }
            },


            /**
             * Who has exterminated this area, if anyone
             * @returns {string|false}
             */
            exterminated(){
                return _.areaExterminated( this.area, this.shared.data.factions );
            },


            /**
             * Return the influence count for each faction in this area
             * @returns {object}
             */
            influences(){
                return _.eachInfluenceInArea( this.area, this.shared.data.factions, true );
            },


            /**
             * Return an array of faction names belonging to factions who have activated this area's skill ability
             * @returns {string[]}
             */
            usedSkill(){
                return [];

                return Object.values( this.shared.data.factions ).map( faction => {
                    if( faction.usedSkills.includes( this.area.name ) ) return faction.name;
                }).filter( item => item );

            }
        },

        methods : {

            /**
             * Close the view area modal
             */
            closeViewArea(){
                this.area = null;
            },

            /**
             * Set our area
             * @param area
             */
            setViewArea( area ){
                // toggle the modal closed if we select the same area twice
                if( this.area && this.area.name === area.name ){
                    this.closeViewArea();
                    return
                }

                // otherwise set the area
                this.area = area;
            }
        }
    }
</script>


<style>
    .view-area {
        background-image : url('/images/factory-background.jpg');
        background-position: center;
        background-size: cover;
        z-index: 3;
        font-size: 1.4rem;
        color: var(--primary-light-color);
    }

    .view-area .title, .view-area .view-player__title {
        color: #fde4ff;
        font-size: 1em;
    }

    .view-area .view-area__controller {
        margin-bottom: 2rem;
    }

    .view-area .view-player__empty {
        font-size: .9em;
    }

    .view-area__unit-image {
        width: 100%;
        border: 1.5px solid rgba(0,0,0,.1);
    }

    .view-area__influence {
        align-items: center;
        font-size: 1.5rem;
        padding-bottom: .3rem;
        padding-left: 1rem;
    }

    .view-area__influence .influence-marker {
        position: relative;
        bottom: .25rem;
    }

    .view-area__influence-count {
        font-size: 1.5em;
        width: 2rem;
        text-align: center;
        margin-right: .2rem;
    }

    .view-area__influence .determine-control__faction-icon{
        width: 1.5em;
        margin-right: .7rem;
    }





    .view-area__token-wrap, .view-area__unit-wrap {
        width: 6vw;
    }

    .view-area__token, .view-area__unit {
        position: absolute;
        width: 100%;
        height: 100%;
        max-width: 6vw;
        max-height: 6vw;
        top: 0;
        left: 0;
        border: 1.5px solid rgba(0,0,0,.1);
    }

    .view-area__upgrade-card-image{
        border: 1.5px solid rgba(0,0,0,.1);
    }

    .view-area__token {
        border-radius: 50%;
    }

    .card-faction-icon {
        left: 50%;
        transform: translate(-50%, -20%);
        width: 20%;
        top: 0;
        border: 1.5px solid white;
        box-shadow: 0 0 2px 4px rgba(0,0,0,.6);
    }


    .empty-result {
        text-align: center;
        padding: 1vw;
        font-size: 1.3em;
        color: var(--primary-light-color);
    }

    .view-area__area {
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        box-shadow: inset 0 0 0px 4px rgba(0,0,0,.5);
        border: 2px solid rgba(255,255,255,.3);
        width: 100%;
        padding: 3px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .view-area__header {
        width: 100%;
        background-size: cover;
        background-position: center bottom;
        background-repeat: no-repeat;
        min-height: 9rem;
    }

    .view-area__body {
        min-height: 20rem;
    }

    .view-area__footer {
        width: 100%;
        background-size: cover;
        background-position: center top;
        background-repeat: no-repeat;
        min-height: 6rem;
        padding-top: 1.5rem;
    }

    .view-area__tokens {
        left: 50%;
        transform: translate(-50%,-50%);
        top: 0;
    }

    .web-row {
        margin: -2em auto 1em;
    }

    .view-area__web-count {
        position: absolute;
        z-index: 4;
        left: 50%;
        top: 0;
        transform: translate(-50%, -15%);
        background-color: rgba(0,0,0,.65);
        padding: .1em .5em;
        border: 2px solid;
        color: var(--highlight-color);
    }

    .area-capitol { background-image: url("/images/areas/capitol-bg.jpg") }
    .area-capitol .area-zoom__header { background-image: url("/images/areas/capitol-top.png") }
    .area-capitol .area-zoom__footer { background-image: url("/images/areas/capitol-bottom.png") }

    .area-sewers { background-image: url("/images/areas/sewers-bg.jpg") }
    .area-sewers .area-zoom__header { background-image: url("/images/areas/sewers-top.png") }
    .area-sewers .area-zoom__footer { background-image: url("/images/areas/sewers-bottom.png") }

    .area-police { background-image: url("/images/areas/police-bg.jpg") }
    .area-police .area-zoom__header { background-image: url("/images/areas/police-top.png") }
    .area-police .area-zoom__footer { background-image: url("/images/areas/police-bottom.png") }

    .area-laboratory { background-image: url("/images/areas/laboratory-bg.jpg") }
    .area-laboratory .area-zoom__header { background-image: url("/images/areas/laboratory-top.png") }
    .area-laboratory .area-zoom__footer { background-image: url("/images/areas/laboratory-bottom.png") }

    .area-factory { background-image: url("/images/areas/factory-bg.jpg") }
    .area-factory .area-zoom__header { background-image: url("/images/areas/factory-top.png") }
    .area-factory .area-zoom__footer { background-image: url("/images/areas/factory-bottom.png") }

    .area-bank { background-image: url("/images/areas/bank-bg.jpg") }
    .area-bank .area-zoom__header { background-image: url("/images/areas/bank-top.png") }
    .area-bank .area-zoom__footer { background-image: url("/images/areas/bank-bottom.png") }

    .area-university { background-image: url("/images/areas/university-bg.jpg") }
    .area-university .area-zoom__header { background-image: url("/images/areas/university-top.png") }
    .area-university .area-zoom__footer { background-image: url("/images/areas/university-bottom.png") }

    .area-subway { background-image: url("/images/areas/subway-bg.jpg") }
    .area-subway .area-zoom__header { background-image: url("/images/areas/subway-top.png") }
    .area-subway .area-zoom__footer { background-image: url("/images/areas/subway-bottom.png") }

    .area-church { background-image: url("/images/areas/church-bg.jpg") }
    .area-church .area-zoom__header { background-image: url("/images/areas/church-top.png") }
    .area-church .area-zoom__footer { background-image: url("/images/areas/church-bottom.png") }
</style>

