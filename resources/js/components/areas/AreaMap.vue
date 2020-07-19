<template>
    <div class="area-map-container" :class="`${area.name}-container`">
        <div class="area-map pos-relative width-100 height-100" :class="computedClasses" @click="shared.event.emit( 'areaClicked', area )">
        <!-- Absolutes -->

            <!-- owner -->
            <img v-if="area.owner"
                 class="area-map__owner-portrait z-2"
                 :src="`/images/factions/${area.owner}/icon.jpg`"
                 :title="`The ${area.owner} control this area`">

            <!-- zoom -->
            <div class="toggle area-map__toggle top-0 right-0"
                 @click.stop="shared.event.emit('viewArea', area )">
                    <i class="icon-zoom_in"></i>
            </div>

            <!-- battle marker -->
            <img v-if="area.battle"
                 class="area-map__battle-marker z-2"
                 src="/images/icons/battle.png"
                 title="A battle will take place here during the combat step">

            <!-- exterminate -->
            <i v-if="exterminated"
               class="area-map__exterminated icon-exterminate z-2"
               :style="`color: var(--faction-${exterminated}); border-color: var(--faction-${exterminated})`"
               :title="`The ${exterminated} have exterminated the ${area.name}`"></i>

            <!-- tokens -->
            <div class="width-100 shrink-0 pos-absolute top-0"><token-row :area="area"></token-row></div>

            <!-- graveyard -->
            <div v-if="graveyard" class="area-map__graveyard">
                <div class="icon-graveyard mb-2"></div>
                <div v-for="(dead, name) in graveyard"
                     class="area-map__graveyard-count"
                     :class="`faction-${name}`"
                     :title="`the ${name} have ${dead} kills in the ${area.name}`">{{ dead }}</div>
            </div>

            <!-- influence -->
            <div v-if="influence.length" class="area-map__influence">
                <div class="influence-marker mb-2">
                    <img src="/images/icons/influence.png">
                </div>
                <div v-for="obj in influence"
                     class="area-map__influence-count"
                     :class="`faction-${obj.name}`"
                     :title="`the ${obj.name} have ${obj.influence} influence in the ${area.name}`">{{ obj.influence }}</div>
            </div>


        <!-- Core Content -->
            <div class="width-100 height-100 area-map__core-content-container">
                    <div class="area-map__core-content width-100 height-100 overflow-auto d-flex align-center justify-center">
                        <div class="d-flex flex-wrap justify-center" style="max-width: 95%">
                            <map-player v-for="faction in shared.data.factions"
                                        :key="faction.name"
                                        :faction="faction"
                                        :area="area"></map-player>
                        </div>
                    </div>
            </div>

            <!-- status icons -->
            <div class="area-map__stats-row pos-absolute bottom-0 width-100 flex-center shrink-0">
                <i v-for="stat in stats"
                   class="stat-icon"
                   :class="`icon-${stat.name} faction-${stat.owner}`"
                   :title="`${stat.title}: ${stat.description} - [${stat.owner}]`"></i>
            </div>
        </div>
    </div>
</template>


<script>
    export default {

        name: 'area-map',
        props: ['area', 'classes'],

        data() {
            return {
                shared : App.state,
                opacity : false,
            };
        },
        mounted(){
            this.shared.event.on( 'areaSelected', area => {
                if( this.area.name !== area.name ) this.opacity = true;
                else this.opacity = false;
            });

            this.shared.event.on( 'unselectAreas', area => this.opacity = false );
        },
        computed : {

            influence(){
                let influence = [];
                if( this.area.owner === 'neutral' ) influence.push( { name : 'neutrals', influence : 1 } );

                _.forEach( this.shared.data.factions, faction => {
                    let factionInfluence = _.influence( faction, this.area, this.shared.data.factions );
                    if( factionInfluence ) influence.push( { name : faction.name, influence : factionInfluence } );
                });

                influence = _.orderBy( influence, ['influence'], ['desc'] );
                return influence;

            },

            graveyard(){
                let dead = {};
                _.forEach( this.shared.data.factions, faction => {
                    let kills = _.killsInArea( faction, this.area, this.shared.data.factions );
                    if( kills ) dead[faction.name] = kills;
                });

                /*
                let dead = [];
                _.forEach( this.shared.data.factions, faction => {
                    dead =  _.concat( dead, faction.units.filter( unit => _.deadInArea( unit, this.area ) ) );
                });

                if( dead.length ){
                    return this.shared.groupByCount( dead, 'faction' );
                }
                */
                return Object.keys( dead ).length ? dead : false;
            },

            exterminated(){
                return _.areaExterminated( this.area, this.shared.data.factions  );
            },

            computedClasses(){
                return `area-map-${this.area.name} ${this.opacity ? 'opacity-4' : ''}`;
            },

            stats(){
                let stats = [];

                // targets
                _.forEach( this.shared.data.factions, faction => {
                    if( faction.cards.target.length && this.shared.canSeeTarget( faction ) && faction.cards.target[0].target === this.area.name ){
                        stats.push({ name : 'target', owner : faction.name, title : '+1AP', description : `the ${faction.name} are targeting this area` } )
                    }
                });

                // targets
                _.forEach( this.shared.data.factions, faction => {
                    if( faction.usedSkills.includes( this.area.name ) ){
                        stats.push({ name : 'skill', owner : faction.name, title : 'skill used', description : `the ${faction.name} have used this area's skill` } )
                    }
                });

                // card effects
                this.area.cards.forEach( card => stats.push({ name : card.class, owner : card.owner, title : card.name, description : card.description } ));

                // token effects
                this.area.tokens.forEach( token => {
                    if( token.areaStat && token.revealed ) stats.push({ name : token.name, owner : token.faction, title : token.name, description : token.description });
                });

                return stats;
            }
        }
    }
</script>


<style>

    .influence-marker {
        width: 1em;
        height: 1em;
    }

    .area-map-container {
        width: 33%;
        height: 33%;
        padding: .40rem;
    }

    .area-map__core-content-container {
        padding: 3.5em .75em 2em;
    }

    .stat-icon {
        width: 1.5em;
        height: 1.5em;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0,0,0,.8);
        border-radius: .25em;
        margin: 0 .1em;
        font-size: 1.2rem;
    }

    .area-map__toggle {
        display: flex;
        padding: .45vw;
        z-index: 3;
    }

    .area-map__owner-portrait, .area-map__battle-marker, .area-map__exterminated {
        width: 2.5rem;
        height: 2.5rem;
        position: absolute;

        border: 2px solid rgba(255,255,255,1);
        outline: 3px solid rgba(0,0,0,.5);
    }

    .area-map__battle-marker {
        bottom:0;
        left:0;
        transform: translate(-15%,15%);
    }

    .area-map__owner-portrait {
        top:0;
        left:0;
        transform: translate(-15%,-15%);
    }

    .area-map__graveyard {
        background-color: rgba(0,0,0,.8);
        padding: .25em;
        align-items: center;
        justify-content: center;
        color: var(--highlight-color);
        border-radius: .2em;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        position: absolute;
        right: 3px;
        top: 50%;
    }

    .area-map__graveyard-count {
        text-align: center;
        font-weight: 700;
    }

    .area-map__influence {
        background-color: rgba(0,0,0,.8);
        padding: .25em;
        align-items: center;
        justify-content: center;
        color: var(--highlight-color);
        border-radius: .2em;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        position: absolute;
        left: 3px;
        top: 50%;
    }

    .area-map__influence-count {
        text-align: center;
        font-weight: 700;
    }

    .area-map__exterminated {
        bottom: 0;
        right:0;
        transform: translate(15%,15%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8em;
        background-color: black;
    }

    .area-map {
        background-position: center top, center;
        background-repeat: no-repeat, no-repeat;
        background-size: 100% 2vw, 100% auto;
        box-shadow: inset 0 0 0px 4px rgba(0,0,0,.5);
        border: 2px solid rgba(255,255,255,.3);
    }

    .church-container { order: 1; }
    .area-map-church {
        background-image: url(/images/areas/church-tokens.png), url(/images/areas/church-bg.jpg);
    }

    .sewers-container { order: 2; }
    .area-map-sewers {
        background-image: url(/images/areas/sewers-tokens.png),url(/images/areas/sewers-bg.jpg);
    }


    .police-container { order: 3; }
    .area-map-police {
        background-image: url(/images/areas/police-tokens.png),url(/images/areas/police-bg.jpg);
    }

    .subway-container { order: 4; }
    .area-map-subway {
        background-image: url(/images/areas/subway-tokens.png),url(/images/areas/subway-bg.jpg);
    }


    .capitol-container { order: 5; }
    .area-map-capitol {
        background-image: url(/images/areas/capitol-tokens.png),url(/images/areas/capitol-bg.jpg);
    }


    .laboratory-container { order: 6; }
    .area-map-laboratory {
        background-image: url(/images/areas/laboratory-tokens.png),url(/images/areas/laboratory-bg.jpg);
    }


    .university-container { order: 7; }
    .area-map-university {
        background-image: url(/images/areas/university-tokens.png),url(/images/areas/university-bg.jpg);
    }


    .bank-container { order: 8; }
    .area-map-bank {
        background-image: url(/images/areas/bank-tokens.png),url(/images/areas/bank-bg.jpg);
    }


    .factory-container { order: 9; }
    .area-map-factory {
        background-image: url(/images/areas/factory-tokens.png),url(/images/areas/factory-bg.jpg);
    }



</style>

