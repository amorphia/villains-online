<template>
    <div v-if="attack"
         class="last-attack center-text pos-absolute-center d-flex flex-wrap align-center justify-center"
         :class="widthClass">

        <div class="width-100 uppercase">last attack <span class="last-attack__needs">needing {{ attack.toHit }}</span></div>

        <unit-icon v-if="unit" :unit="unit" noSelect="true" :classes="`faction-${attack.faction} mr-3`"></unit-icon>
        <div v-else class="units-hud__unit d-inline-block pos-relative" :class="`faction-${attack.faction}`">
            <img class="unit-hud__unit-image" :src="factionIcon( attack.faction )">
        </div>

        <img class="last-attack__victim" :src="victimImage">

        <div class="d-flex">
            <img v-for="roll in attack.rolls"
             class="last-attack__roll"
             :class="{'saturate-0' : roll < attack.toHit}"
             :src="`/images/icons/attack-${roll}.png`">
        </div>
    </div>
</template>


<script>
    export default {

        name: 'last-attack',
        props : ['attack'],
        data() {
            return {
                shared : App.state
            };
        },
        computed : {
            victimImage(){

                if( this.attack.unit.deadly ){
                    return`/images/icons/deadly-square.png`;
                }

                if( this.attack.targetUnit ){
                    let unit = this.attack.targetUnit;
                    let src = `/images/factions/${unit.faction}/units/${unit.type}`;
                    if( unit.flipped ) src += '-flipped';
                    return src + '.png';
                }

                return this.factionIcon( this.attack.victim );
            },

            unit(){
                if( ! this.attack || !this.attack.unit ) return;
                return this.shared.data.factions[this.attack.faction].units.find(
                    unit => unit.id === this.attack.unit.id
                );
            },

            widthClass(){
                switch( this.attack.rolls.length ){
                    case 1 : return 'width-40';
                    case 2 : return 'width-50';
                    case 3 : return 'width-60';
                    case 4 : return 'width-70';
                    default  : return 'width-90';
                }
            }
        },

        methods : {
            factionIcon( factionName ){
                return _.factionIcon( factionName );
            },
        }
    }
</script>


<style>
    .last-attack__victim {
        width: 3rem;
        margin-left: -.5rem;
        margin-right: .5rem;
        box-shadow: 0 0 0.3rem 0.15rem rgba(0,0,0,.5);
    }

    .last-attack__needs {
        font-size: .7em;
        color: var(--primary-light-color);
        position: relative;
        bottom: .15em;
        left: .2rem;
    }

    .last-attack {
        color: var(--highlight-color);
        background-image: url(/images/background-blurred.jpg);
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        border-radius: 1rem;
        border: 1px solid white;
        box-shadow: 0 0 0.5rem 0.2rem black;
        padding: .5rem;
        top: 45%;
    }

    .last-attack .unit-hud__unit-image {
        border: 2px solid;
        box-shadow: 0 0 .4rem .2rem black;
    }

    .last-attack__roll{
        width: 4.55rem;
        margin: 0 .1rem;
    }
</style>

