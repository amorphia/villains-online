<template>
    <div class="combat-faction player-hud" :class="activeClass">
        <div class="d-flex align-center">
            <div class="combat-faction__name mr-3">
                <img class="combat-faction_icon" :src="factionIcon">
                The {{ faction.name | startCase }}
            </div>

            <div class="combat-faction__pips d-flex flex-wrap mt-2">
                <i v-for="pip in unitPips"
                   class="combat-faction__pip"
                   :class="pip ? 'icon-circle active' : 'icon-circle-open'"></i>
            </div>
        </div>

        <div v-if="faction.mods.length" class="combat-faction__mods bg-shadow-2 p-3 mt-2 accent-font">
            <div v-for="mod in faction.mods" class="combat-faction__mod mb-2" v-html="shared.filterText( mod.text )"></div>
        </div>

    </div>
</template>


<script>
    export default {

        name: 'combat-faction',
        props : ['faction', 'combat'],
        data() {
            return {
                shared : App.state
            };
        },

        computed : {
            factionIcon(){
                return _.factionIcon( this.faction.name );
            },

            activeClass(){
                if( this.faction.order === this.combat.factionIndex ) return 'active';
                if( this.faction.order < this.combat.factionIndex ) return 'done';
                return '';
            },
            unitPips(){
                return this.faction.units.map( unit => unit.needsToAttack ).sort().reverse();
            }
        }
    }
</script>


<style>

    .view-combat .combat-faction {
        cursor: unset;
    }

    .combat-faction.done {
        opacity: .5;
    }

     .combat-faction__name {
         font-size: 1.2em;
     }

     .active .combat-faction__name {
         color: var(--highlight-color);
     }

    .combat-faction_icon {
        width: 1.1em;
        margin-right: .2em;
        position: relative;
        top: .2em;
    }

     .combat-faction__pip {
         font-size: .7em;
         display: block;
         padding: .2em;
         color: var(--primary-light-color);
     }

     .combat-faction__pip.active {
         color: var(--highlight-color);
     }

    .combat-faction__mods {
        font-size: .85em;
    }

    .combat-faction__mod:last-child {
        margin-bottom: 0;
    }

</style>

