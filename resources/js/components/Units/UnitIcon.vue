<template>
    <div class="d-inline-block pos-relative">
        <div class="units-hud__unit d-inline-block pos-relative"
             :class="setClasses"
             @click="$emit( 'unit', unit, hpLeft )">

            <div v-if="viewableGhost" class="ghost-icon__container"></div>

            <token-slot v-if="hasToken" :forcedtoken="hasForcedToken" :token="hasRegularToken"></token-slot>

            <img class="unit-hud__unit-image" :src="img">
        </div>

        <div v-if="assigningHits" class="assign-hit__pips d-flex justify-center flex-wrap">
            <i v-for="(pip) in hitPips"
               class="assign-hit__pip"
               :class="pip.active ? 'icon-circle active' : 'icon-circle-open'"></i>
        </div>

        <div v-if="unit.killed" class="unit-killed pos-absolute top-0"><i class="icon-kill"></i></div>
    </div>
</template>


<script>
    export default {

        name: 'unit-icon',

        props : ['unit', 'selectedUnit', 'assigningHits', 'allSelected', 'classes', 'noSelect', 'hidePatsies' ],
        data() {
            return {
                shared : App.state
            };
        },
        computed :{

            hasForcedToken(){
                if( this.unit.placeToken ) return this.unit.placeToken;
            },

            hasRegularToken(){
                if( this.unit.token ) return this.unit.token;
            },

            hasToken(){
                return this.hasForcedToken || this.hasRegularToken;
            },

            viewableGhost(){
                return this.unit.ghost && this.shared.faction.ghostDeploy;
            },

            setClasses(){
                let classes = [];
                if( !this.noSelect && ( this.selected || (this.unit.isSelected && !this.unit.placeToken) ) ) classes.push( 'selected' );
                if( this.unit.ready ) classes.push( 'ready' );
                if( this.viewableGhost ) classes.push( 'is-ghost' );
                if( this.classes ) classes.push( this.classes );
                if( this.unit.type === 'patsy' && this.hidePatsies ) classes.push( 'opacity-6' );
                return classes.join(' ');
            },

            img(){
                if( this.unit.ghost && !this.shared.faction.ghostDeploy ) return `/images/factions/ghosts/units/ghost.png`;

                return `/images/factions/${this.unit.faction}/units/${this.unit.type}${this.unit.flipped ? '-flipped' : ''}.png`;
            },

            selected(){
                return this.allSelected || ( this.selectedUnit && this.unit.id === this.selectedUnit.id ) || this.unit.selected;
            },

            hitPips(){
                let pips = [];

                if( this.unit.hits ){
                    for( let i = 0; i < this.unit.hits; i++ ){
                        pips.push({ active : true });
                    }
                }

                if( this.hpLeft ) {
                    for( let i = 0; i < this.hpLeft; i++ ){
                        pips.push({ active : false });
                    }
                }

                return pips;
            },

            hpTotal(){
                return (this.unit.toughness && !this.unit.flipped)
                || (this.unit.type === 'champion' && this.unit.flipped && this.unit.faction === 'vampires' ) ? 2 : 1;
            },

            hpLeft(){
                let hits = this.unit.hits ?? 0;
                return this.hpTotal - hits;
            }
        },

       methods : {

       }

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

    .assign-hit__pips {

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

