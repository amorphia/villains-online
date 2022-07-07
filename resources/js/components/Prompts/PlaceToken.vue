<template>
    <div class="place-token-top p-4 d-flex justify-center align-center">

        <!-- pass confirmation -->
        <player-prompt v-if="confirmingPass" classes="">
            <div class="px-5">
                <div class="title">Are you sure you want to pass?</div>
                <div class="flex-center">
                    <button class="button button-empty" @click="confirmingPass = false">no</button>
                    <button class="button" @click="passToken">Yes Pass</button>
                </div>
            </div>
        </player-prompt>


        <!-- pass confirmation -->
        <player-prompt v-if="placeGhostPrompt" classes="">
            <div class="px-5">
                <div class="title center-text">Place a ghost in an area you control</div>
                <div class="mt-3 pb-4">
                    <!-- reserves -->
                    <area-flipper
                        :areas="ghostableAreas"
                        :index="ghostAreaIndex"
                        @update="updateGhostIndex"
                    >
                        <unit-row
                            :units="ghosts"
                            :selectedUnit="ghost"
                            @unit="clickGhost"
                        ></unit-row>
                        </area-flipper>
                </div>

                <div v-if="ghost" class="place-token-req center-text prompt-question" v-html="shared.filterText(ghost.description)"></div>

                <div class="flex-center">
                    <button class="button button-empty" @click="() => {
                        this.placeGhostPrompt = false;
                        this.ghost = null;
                    }">back</button>
                    <button class="button" :disabled="!ghost" @click="placeGhost">Place Ghost</button>
                </div>
            </div>
        </player-prompt>

        <!-- pass button -->
        <button class="button button-empty place-token__button right-text" @click="confirmingPass = true">PASS</button>

        <!-- tokens -->
        <div class="place-token__tokens center-text pos-relative">
            <token-set
                :tokens="reserves"
                classes="one-line"
                :selected="token"
                noBorder="true"
            ></token-set>
            <div v-if="token && token.req" class="place-token-req prompt-question">{{ token.req }}</div>
        </div>

        <span v-if="ghostableAreas.length && ghosts.length"  @click="()=>{
            this.placeGhostPrompt = true;
            this.removeToken();
        }">
            <unit-icon
                class="pointer"
                :unit="{ type: 'banshee', faction: 'ghosts', flipped: true }"
            />
        </span>


        <!-- save place token -->
        <button class="button place-token__button" @click="placeToken" :disabled="saveDisabled">place token</button>
    </div>
</template>


<script>

    export default {

        name: 'place-token',
        data() {
            return {
                shared : App.state,
                areaIndex : 0,
                token : null,
                ghost: null,
                confirmingPass : false,
                placeGhostPrompt: false,
                ghostAreaIndex: 0,
            };
        },

        watch : {

            // handle area index change events
            areaIndex(){
                if( this.xavier ) this.$set( this.xavier, 'isSelected', this.areaIndex === -1 );
                this.shared.event.emit('areaSelected', this.area );
            },

            // Reset this on each game action
            'shared.data.gameAction'(){
                this.removeToken();
            }
        },

        mounted(){
            // init listeners
            this.shared.event.on( 'tokenClicked', this.tokenClicked );
            this.shared.event.on( 'areaClicked', this.areaClicked );
            this.shared.event.on( 'xavierClicked', this.xavierClicked );

            // should we chow xavier
            if( this.canXavier ){
                this.shared.showXavier = true;
            }

            // set selected area
            this.$nextTick( () => {
                this.shared.event.emit('areaSelected', this.area );
            });

        },

        computed : {

            /**
             * Returns Xavier blackstone if we are the society, or false if we are not
             * @returns {Unit|false}
             */
            xavier(){
                if( this.shared.faction.name !== 'society' ) return false;
                return this.shared.faction.units.find( unit => unit.type === 'champion' );
            },


            /**
             * Can we place a token on xavier blackstone?
             * @returns {boolean}
             */
            canXavier(){
                if( !this.xavier ) return false;
                // if xavier doesn't already have a token
                return ! this.xavier.token;
            },


            /**
             * Is our ability to save disabled?
             * @returns {boolean}
             */
            saveDisabled(){
                return !this.token || _.money( this.shared.faction ) < this.shared.faction.tokenCost;
            },

            /**
             * Returns this faction's token reserves
             * @returns {Token[]}
             */
            reserves(){
                return this.shared.faction.tokens.filter( token => !token.location );
            },


            /**
             * Returns the area we are placing a token in (or Xavier when applicable)
             * @returns {{name: *, type: string}|*}
             */
            area(){
                if( this.areaIndex === -1 ) return { name : this.xavier.location, type: 'xavier' };
                return this.availableAreas[this.areaIndex];
            },


            /**
             * Return an array of areas where we can place an action token
             * @returns {Area[]}
             */
            availableAreas(){
                return Object.values( this.shared.data.areas ).filter( area => area.tokens.length < area.maxTokens );
            },

            ghostableAreas(){
                if(!this.shared.faction.canPlaceGhostsDuringTokens || !this.shared.faction.areas.length || !this.ghosts.length) return [];
                let areas = this.shared.faction.units.reduce((areas, unit) => {
                    if(_.unitInPlay(unit, { isChampion: true } )) areas.push(unit.location);
                    return areas;
                }, [])
                areas = _.xor(this.shared.faction.areas, areas);

                return areas.map(area => this.shared.data.areas[area]);
            },

            ghosts(){
                return this.shared.faction.units.filter(unit => _.unitInReserves(unit, { isChampion: true } ));
            },

            ghostArea(){
                return this.ghostableAreas[this.ghostAreaIndex];
            },
        },

        methods : {
            updateGhostIndex( index ){
                this.ghostAreaIndex = index;
            },

            clickGhost(unit){
                this.ghost = unit;
                this.$set( unit, 'place', this.ghostArea.name );
            },

            /**
             * Remove our selected token
             */
            removeToken(){
                // reset token
                if( this.token ){
                    this.$set( this.token, 'place', null );
                    this.token = null;
                }

                // reset xavier token
                if( this.xavier && this.xavier.placeToken ){
                    this.$set( this.xavier, 'placeToken', null );
                }

                // remove token from shared state
                this.shared.token = null;
            },

            removeGhost(){
                // reset token
                if( this.ghost ){
                    this.$set( this.ghost, 'place', null );
                    this.ghost = null;
                }

                this.placeGhostPrompt = false;
            },

            /**
             * Set our selected token
             * @param token
             */
            setToken( token ) {

                // set our token, and shared state token
                this.token = token;
                this.shared.token = this.token;

                // place token on xavier, if applicable
                if( this.area.type === 'xavier' ){
                    this.placeXavierToken();
                    return;
                }

                // set token placement
                this.$set( this.token, 'place', this.area.name );
            },


            /**
             * Handle token clicks
             *
             * @param token
             */
            tokenClicked( token ){
                this.placeGhost = false;
                this.ghost = null;

                // if we clicked an already placed token, abort
                if( token.location ) return;

                // if we click a token we already selected unselect it
                if( this.token && this.token.id === token.id ){
                    this.removeToken();
                    return;
                }

                // otherwise select the token
                this.setToken( token );

            },


            /**
             * Handle clicking on xavier
             */
            xavierClicked(){
                // if xavier already has a token placed on him, do nothing
                if( this.xavier.token ) return;

                // set area selected
                this.areaIndex = -1;
                this.shared.event.emit('areaSelected', { name : this.xavier.location } );

                // remove xavier's token if we are already placing a token on him
                if( this.xavier.placeToken && this.xavier.placeToken.id ===  this.token.id ){
                    this.removeToken();
                    return;
                }

                // otherwise place our token on xavier
                if( this.token ) this.placeXavierToken();
            },


            /**
             * Place a token on xavier
             */
            placeXavierToken(){
                this.$set( this.xavier, 'placeToken', this.token );
                this.$set( this.token, 'place', 'xavier' );
            },


            /**
             * Handle clicking on an area
             * @param area
             */
            areaClicked( area ){
                // did we click on a valid area? If not, return
                let index = _.findIndex( this.availableAreas, item => item.name === area.name );
                if( index === -1 ) return;

                this.areaIndex = index;

                // if we have a token selected, place it on our area/xavier
                if( this.token ){
                    this.$set( this.token, 'place', this.area.name );
                    if( this.xavier ){
                        this.$set( this.xavier, 'placeToken', null );
                    }
                }
            },


            /**
             * Resolve our token placement
             */
            placeToken(){
                this.shared.respond( 'place-token', 'place', this.token.place, this.token.id );
                this.reset();
            },

            /**
             * Resolve our token placement
             */
            placeGhost(){
                this.shared.respond( 'place-token', 'ghost', this.ghost.place, this.ghost.id );
                this.reset();
            },

            /**
             * Pass on placing tokens
             */
            passToken(){
                this.shared.respond( 'place-token', 'pass' );
                this.reset();
            },

            reset(){
                this.removeGhost();
                this.shared.showXavier = false;
                this.removeToken();
            }
        }
    }
</script>


<style>

    .place-token-top {
        /* overflow: hidden; */
        transition: all .5s;
    }

    .place-token {
        min-width: 40rem;
    }

    .place-token__button {
        width: 12%
    }

    .place-token-top .tokens-hud__token {
        width: 5.5vw;
        height: 5.5vw;
    }

    .place-token__tokens .place-token-req {
        position: absolute;
        bottom: -1.1em;
        left: 50%;
        transform: translateX(-50%);
        font-size: 1.2em;
        letter-spacing: 1px;
        width: 70vw;
    }

</style>
