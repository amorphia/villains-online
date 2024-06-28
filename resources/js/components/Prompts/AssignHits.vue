<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-6">
            <div class="width-100 d-flex justify-center flex-column align-center">

                <!-- title -->
                <div class="title mb-4">Assign {{ data.hits }} {{ data.hits === 1 ? 'hit' : 'hits' }}</div>
                <div class="prompt-question">Assign {{ hitsToAssign }} more {{ hitsToAssign === 1 ? 'hit' : 'hits' }}</div>

                <!-- area -->
                <div class="mt-3 pb-4">
                    <area-flipper
                        :areas="[area]"
                        index="0"
                        classes="area-header__units pt-0">

                        <!-- units -->
                        <unit-row :units="units"
                                  assigningHits="true"
                                  :hidePatsies="mustAssignToNonPatsy"
                                  :hitsToAssign="data.hits"
                                  @unit="assignHit"></unit-row>
                    </area-flipper>

                </div>

                <!-- gnome deflection -->
                <div v-if="hasGnome" class="gnome-deflects primary-light">
                    Use Gnome's ability to cancel hits?
                    <div class="d-flex align-center justify-center">
                        <i :disabled="gnomeDeflects === 0" @click="gnomeDeflects--" class="icon-minimize pr-2"></i>
                        <span class="highlight mr-3">{{ gnomeDeflects }}</span> hits cancelled <span class="gnome-cost" v-if="cost" v-html="shared.filterText( `xC${cost}x` )"></span>
                        <i :disabled="!canDeflect" @click="gnomeDeflects++" class="icon-maximize ml-2"></i>
                    </div>
                </div>

                <!-- token deflection -->
                <div v-if="hasTokenDeflect" class="gnome-deflects primary-light">
                    Discard this tokens to cancel all hits?

                    <div class="d-flex justify-center">
                        <token-set-item :token="firstTokenInArea" noEmit="true" :hideUnrevealed="true"></token-set-item>
                    </div>


                    <div class="d-flex align-center justify-center">
                        <i :disabled="tokenDeflects === 0" @click="tokenDeflects = 0" class="icon-minimize pr-2"></i>
                        <span class="highlight mr-3">{{ tokenDeflects }}</span> hits cancelled
                        <i :disabled="!canTokenDeflect" @click="setTokenDeflects" class="icon-maximize ml-2"></i>
                    </div>
                </div>

                <!-- seeking warning -->
                <div v-if="data.seeking" class="prompt-question" v-html="shared.filterText( `Seeking xSEEKx: Hits must be assigned to a non-patsy unit if possible` )"></div>


                <!-- submit -->
                <div class="flex-center">
                    <button class="button"
                            @click="resolve"
                            :disabled="hitsToAssign > 0 && hitsAssigned">{{ buttonMessage }}</button>
                </div>

            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'assign-hits',
        data() {
            return {
                shared : App.state,
                gnomeDeflects : 0,
                tokenDeflects: 0,
            };
        },

        mounted(){
            // add smoke token to the area, if applicable
            if( this.hasSmoke ){
                this.shared.faction.units.push({
                    id : 'smoke',
                    name : 'smoke',
                    type: 'smoke',
                    faction: 'ninjas',
                    hits : 0,
                    hitsAssigned: 0,
                    location : this.area.name
                })
            }
        },

        methods : {

            /**
             * Resolve this prompt
             * @param option
             */
            resolve( option ){
                let data = {
                    cost : this.cost,
                    tokenDeflects: this.tokenDeflects > 0 ? 1 : 0,
                    area : this.area.name,
                    targets : []
                };

                // add our unit hits
                this.units.forEach( unit => {
                    if( unit.hits ) data.targets.push({ id : unit.id, hits : unit.hits });
                });

                data = { ...this.data, ...data };
                this.shared.respond( 'assign-hits', data );
            },

            setTokenDeflects(){
                this.clearAllHits();
                this.tokenDeflects = this.data.hits;
            },

            /**
             * Clear all unit hits
             */
            clearAllHits(){
                this.units.forEach( unit => this.$set( unit, 'hits', 0 ) );
            },


            /**
             * Assign a hit to a unit
             *
             * @param unit
             * @param hpLeft
             */
            assignHit( unit, hpLeft ){

                /*
                // assign hits to a smoke token
                if( unit.type === 'smoke' ){
                    if( hpLeft ){
                        this.clearAllHits();
                        this.$set( unit, 'hits', this.data.hits );
                        return;
                    } else {
                        this.$set( unit, 'hits', 0 );
                    }
                }
                */

                // return if we have no hits to assign
                if( !this.hitsToAssign ){
                    if( unit.hits ) this.$set( unit, 'hits', unit.hits - 1 );
                    return;
                }

                // we can't assign seeking hits to patsies (unless no other options)
                if( unit.type === 'patsy' && this.mustAssignToNonPatsy ){
                    App.event.emit( 'sound', 'error' );
                    return;
                }

                // assign a hit to this unit, if we can
                if( hpLeft ){
                    if( !unit.hits ) this.$set( unit, 'hits', 1 );
                    else this.$set( unit, 'hits', unit.hits + 1 );
                    return;
                }

                // otherwise clear the hits
                this.$set( unit, 'hits', 0 );
            },

        },

        computed : {

            /**
             * Is there a smoke token able to take hits for us?
             * @returns {boolean}
             */
            hasSmoke(){
                return this.shared.faction.smokeAreas?.includes( this.area.name );
            },


            /**
             * Are we forced to assign these hits to non-patsies
             * @returns {boolean}
             */
            mustAssignToNonPatsy(){
                return this.data.seeking && this.assignableNonPatsyHits > this.hitsAssigned;
            },


            /**
             * Return our button text
             * @returns {string}
             */
            buttonMessage(){
                return this.hitsToAssign === 0 ?  "confirm hit assignment" : `assign ${this.hitsToAssign} more hits`;
            },

            firstTokenInArea(){
                return this.area.tokens.find( token => token.faction === this.shared.faction.name) ?? {};
            },

            /**
             * Can we use the gnome delfect to block hits?
             * @returns {boolean}
             */
            canDeflect(){
                if( this.hitsToAssign === 0 ) return;
                let money = this.shared.faction.resources + this.shared.faction.energy;
                return money >= this.cost + 2;
            },

            canTokenDeflect(){
                if( this.hitsToAssign === 0 || !this.data.unit ) return;
                let tokens = this.shared.faction.tokens.filter(token => token.location === this.area.name).length;
                return tokens > this.tokenDeflects;
            },

            /**
             * Calculate our gnome deflect cost
             * @returns {number}
             */
            cost(){
                return 2 * this.gnomeDeflects;
            },


            /**
             * Do we have a gnome here?
             * @returns {boolean}
             */
            hasGnome(){
                return this.shared.faction.name === 'bankers'
                        && _.find( this.shared.faction.units, unit => unit.location === this.area.name && unit.type === 'champion' );
            },

            hasTokenDeflect(){
              return this.shared.faction.tokenDeflect && this.firstTokenInArea;
            },

            /**
             * How many hits do we have left to assign?
             * @returns {number}
             */
            hitsToAssign(){
                let hitsToAssign = this.data.hits - this.hitsAssigned - this.gnomeDeflects - this.tokenDeflects;
                if( hitsToAssign > this.assignableHits ) hitsToAssign = this.assignableHits;
                return this.assignableHits - this.hitsAssigned === 0 ? 0 : hitsToAssign;
            },


            /**
             * How many hits can be assigned to these units?
             * @returns {number}
             */
            assignableHits(){
                return _.assignableHits( this.units );
            },

            /**
             * How many hits can be assigned to non-patsies?
             * @returns {number}
             */
            assignableNonPatsyHits(){
                return _.assignableHits( this.units, { nonPatsy : true } );
            },


            /**
             * How many hits have we assigned so far?
             * @returns {number}
             */
            hitsAssigned(){
                return this.units.reduce( (hits, unit) => {
                    if( unit.hits ) hits += unit.hits;
                    return hits;
                }, 0);
            },


            /**
             * Returns an array of the units we can assign hits to
             * @returns {Unit[]}
             */
            units(){
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, this.area, { notHidden : true } ) );
            },


            /**
             * Returns our prompt data
             * @returns {null}
             */
            data(){
                return this.shared.player.prompt.data;
            },


            /**
             * Returns our area object
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[ this.data.area ];
            },
        }
    }
</script>


<style>
    .gnome-deflects {
        font-size: 1.4em;
    }

    .gnome-cost {
        top: .15em;
    }
</style>
