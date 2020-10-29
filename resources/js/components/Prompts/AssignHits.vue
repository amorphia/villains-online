<template>
    <player-prompt classes="">
        <div class="choose-action overflow-auto px-6">
            <div class="width-100 d-flex justify-center flex-column align-center">


                <div class="title mb-4">Assign {{ data.hits }} {{ data.hits === 1 ? 'hit' : 'hits' }}</div>
                <div class="prompt-question">Assign {{ hitsToAssign }} more {{ hitsToAssign === 1 ? 'hit' : 'hits' }}</div>

                <div class="mt-3 pb-4">
                    <area-flipper
                        :areas="[area]"
                        index="0"
                        classes="area-header__units pt-0"
                        >
                        <unit-row :units="units" assigningHits="true" :hidePatsies="mustAssignToNonPatsy" @unit="assignHit"></unit-row>
                    </area-flipper>

                </div>

                <div v-if="hasGnome" class="gnome-deflects primary-light">
                    Use Gnome's ability to cancel hits?
                    <div class="d-flex align-center justify-center">
                        <i :disabled="gnomeDeflects === 0" @click="gnomeDeflects--" class="icon-minimize pr-2"></i>
                        <span class="highlight mr-3">{{ gnomeDeflects }}</span> hits cancelled <span class="gnome-cost" v-if="cost" v-html="shared.filterText( `xC${cost}x` )"></span>
                        <i :disabled="!canDeflect" @click="gnomeDeflects++" class="icon-maximize ml-2"></i>
                    </div>
                </div>

                <div v-if="data.seeking" class="prompt-question" v-html="shared.filterText( `Seeking xSEEKx: Hits must be assigned to a non-patsy unit if possible` )"></div>

                <div class="flex-center">
                    <button class="button"
                            @click="resolve"
                            :disabled="hitsToAssign > 0 && assignableHits !== 0">{{ buttonMessage }}</button>
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
            };
        },

        methods : {
            resolve( option ){

                let data = {
                    cost : this.cost,
                    targets : []
                };

                this.units.forEach( unit => {
                    if( unit.hits ) data.targets.push({ id : unit.id, hits : unit.hits });
                });

                data = Object.assign( {}, this.data, data );
                this.shared.respond( 'assign-hits', data );
            },

            assignHit( unit, hpLeft ){

                if( !this.hitsToAssign ){
                    if( unit.hits ) this.$set( unit, 'hits', unit.hits - 1 );
                    return;
                }

                if( unit.type === 'patsy' && this.mustAssignToNonPatsy ){
                    App.event.emit( 'sound', 'error' );
                    return;
                }

                if( hpLeft ){
                    if( !unit.hits ) this.$set( unit, 'hits', 1 );
                    else this.$set( unit, 'hits', unit.hits + 1 );
                } else {
                    this.$set( unit, 'hits', 0 );
                }
            },

        },

        computed : {

            mustAssignToNonPatsy(){
                return this.data.seeking && this.assignableNonPatsyHits > 0;
            },

            buttonMessage(){
                return this.hitsToAssign === 0 ?  "confirm hit assignment" : `assign ${this.hitsToAssign} more hits`;
            },

            canDeflect(){
                if( this.hitsToAssign === 0 ) return;
                let money = this.shared.faction.resources + this.shared.faction.energy;

                return money >= this.cost + 2;
            },

            cost(){
                return 2 * this.gnomeDeflects;
            },

            hasGnome(){
                return this.shared.faction.name === 'bankers'
                        && _.find( this.shared.faction.units, unit => unit.location === this.area.name && unit.type === 'champion' );
            },

            hitsToAssign(){
                return this.data.hits - this.hitsAssigned - this.gnomeDeflects;
            },

            assignableHits(){
                return _.assignableHits( this.units );
            },

            assignableNonPatsyHits(){
                return _.assignableHits( this.units, { nonPatsy : true } );
            },

            hitsAssigned(){
                let hits = 0;
                this.units.forEach( unit => {
                    if( unit.hits ) hits += unit.hits;
                });
                return hits;
            },

            units(){
                return this.shared.faction.units.filter( unit => _.unitInArea( unit, this.area, { notHidden : true } ) );
            },

            data(){
                return this.shared.player.prompt.data;
            },

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
