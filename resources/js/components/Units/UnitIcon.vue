<template>
    <div class="d-inline-block pos-relative">
        <div class="units-hud__unit d-inline-block pos-relative"
             :class="setClasses"
             @click="$emit( 'unit', unit, hpLeft )">

            <!-- ghost icon container -->
            <div v-if="viewableGhost" class="ghost-icon__container"></div>

            <!-- xavier token -->
            <token-slot v-if="hasToken" :forcedtoken="unit.placeToken" :token="unit.token"></token-slot>

            <!-- unit image -->
            <img class="unit-hud__unit-image" :src="img">
        </div>

        <!-- hit pips -->
        <div v-if="assigningHits" class="assign-hit__pips d-flex justify-center flex-wrap">
            <i v-for="(pip) in hitPips"
               class="assign-hit__pip"
               :class="pip.active ? 'icon-circle active' : 'icon-circle-open'"></i>
        </div>

        <!-- killed icon -->
        <div v-if="unit.killed" class="unit-killed pos-absolute top-0"><i class="icon-kill"></i></div>
    </div>
</template>


<script>
    export default {

        name: 'unit-icon',
        props : [
            'unit',
            'selectedUnit',
            'assigningHits',
            'allSelected',
            'classes',
            'noSelect',
            'hidePatsies',
            'hitsToAssign'
        ],

        data() {
            return {
                shared : App.state
            };
        },

        computed :{

            /**
             * Do we have either a regular token or a forced token
             * @returns {boolean}
             */
            hasToken(){
                return !! (this.unit.placeToken || this.unit.token);
            },


            /**
             * Is this unit a viewable ghost?
             * @returns {boolean}
             */
            viewableGhost(){
                return this.unit.ghost && this.shared.faction.ghostDeploy;
            },


            /**
             * Set our classes
             * @returns {string}
             */
            setClasses(){
                let classes = [];

                // pass any classes passed by our classes prop
                if( this.classes ) classes.push( this.classes );

                // is this unit selected
                if( !this.noSelect && ( this.selected || (this.unit.isSelected && !this.unit.placeToken) ) ) classes.push( 'selected' );

                // is this unit ready
                if( this.unit.ready ) classes.push( 'ready' );

                // is this unit a viewable ghost
                //if( this.viewableGhost ) classes.push( 'is-ghost' );

                // if this is a patsy and we are hiding patsies, reduce the opactiy
                if( this.unit.type === 'patsy' && this.hidePatsies ) classes.push( 'opacity-6' );

                // join and return our classes
                return classes.join(' ');
            },


            /**
             * Returns the url string for our unit's icon
             * @returns {string}
             */
            img(){
                // abandoned version of the ghosts
                //if( this.unit.ghost && !this.shared.faction.ghostDeploy ) return `/images/factions/ghosts/units/ghost.png`;

                return `/images/factions/${this.unit.faction}/units/${this.unit.type}${this.unit.flipped ? '-flipped' : ''}.png`;
            },


            /**
             * Is this unit selected
             * @returns {boolean}
             */
            selected(){
                return this.allSelected // if all units are selected then sure
                    || ( this.selectedUnit && this.unit.id === this.selectedUnit.id ) // if this unit id matches a selected unit we were passed via props
                    || this.unit.selected; // or if this unit has the selected prop
            },


            /**
             * Returns an array of true/false values equal to the number of potential assignable hits
             * with false values being unassigned hits, and true values being assigned hits
             *
             * @returns {boolean[]}
             */
            hitPips(){
                let pips = [];

                // add the hits currently assigned
                if( this.unit.hits ){
                    for( let i = 0; i < this.unit.hits; i++ ){
                        pips.push({ active : true });
                    }
                }

                // add empty pips for hits we may still assign
                if( this.hpLeft ) {
                    for( let i = 0; i < this.hpLeft; i++ ){
                        pips.push({ active : false });
                    }
                }

                return pips;
            },


            /**
             * Returns the units total hit points
             *
             * @returns {number}
             */
            hpTotal(){
                // smoke can be assigned any number of hits from one source
                if( this.unit.type === 'smoke' ) return this.hitsToAssign;

                // hidden units can't be assigned hits
                if( this.unit.hidden ) return 0;

                // units with toughness that have not been flipped yet can take 2 hits
                if( this.unit.toughness && !this.unit.flipped ) return 2;

                // all other units can take 1 hit by default
                return 1;
            },


            /**
             * Return our remaining number of hit points (Our hit points total minus
             * the hits we've already been assigned)
             *
             * @returns {number}
             */
            hpLeft(){
                let hits = this.unit.hits ?? 0;
                return this.hpTotal - hits;
            }
        },
    }
</script>


<style>
    .unit-row .units-hud__unit {
        padding: 3px;
        width: 6vw;
        height: 6vw;
        margin: 0 5px;
        position: relative;
    }

    .unit-row .units-hud__unit img {
        z-index: 2;
        position: relative;
        outline: 3px solid rgba(0,0,0,.3);
    }

    .unit-row  .units-hud__unit.ready:after {
        left: 50%;
        content: "";
        background-image: url(/images/icons/skilled.png);
        background-size: cover;
        position: absolute;
        width: 3vw;
        height: 3vw;
        z-index: 5;
        transform: translate(-50%,-50%);
        top: 50%;
    }

    .assign-hit__pip {
        font-size: .8em;
        display: block;
        padding: .3em;
        color: white;
        text-shadow: 0 1px 2px black, 0 0 2px black, 0 0 2px black;
    }

    .assign-hit__pip.active {
        color: var(--highlight-color);
    }

    .units-hud__unit.is-ghost .unit-hud__unit-image {
        /* opacity: .8; */
    }

    .ghost-icon__container:before {
        content: "";
        position: absolute;
        width: 40%;
        height: 40%;
        /* background-image: url(/images/icons/ghost.png); */
        z-index: 3;
        left: 50%;
        top: 15%;
        background-repeat: no-repeat;
        background-size: contain;
        transform: translate(-50%, -70%);
    }

</style>

