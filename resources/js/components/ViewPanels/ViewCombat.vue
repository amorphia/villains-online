<template>
    <transition name="right">
        <div v-if="combat" :class="{closed : !open}" class="view-combat pos-absolute width-100 height-100 top-0 z-4">
            <button @click="open = !open" class="toggle minimize-toggle top right">
                <i :class="!open ? 'icon-maximize' : 'icon-minimize'"></i>
            </button>

            <div class="width-100 height-100 overflow-auto p-5">
                <div class="d-flex align-stretch">
                    <div class="view-area__main-content width-35 pt-2 pr-5 pb-6">

                        <div class="title">{{combat.title}}</div>

                        <div class="faction-list">
                            <combat-faction v-for="faction in combat.factions"
                                            :faction="faction"
                                            :key="faction.name"
                                            :combat="combat">
                            </combat-faction>
                        </div>

                    </div>

                    <div class="view-player__main-content width-65 pt-2 pr-5 pb-3 h-100">

                        <div class="p-0 width-100 view-area__area pos-relative" :class="`area-${area.name}`">

                            <!-- zoom -->
                            <div class="toggle area-map__toggle top-0 right-0"
                                 @click.stop="shared.event.emit('viewArea', area )">
                                <i class="icon-zoom_in"></i>
                            </div>

                            <div class="view-combat__header area-zoom__header p-4 pos-relative grow-0 shrink-0">
                                <!-- last attack -->
                                <div v-if="combat.lastAttack" class="view-combat__last-attack center-text pos-absolute-center d-flex flex-wrap align-center justify-center">
                                    <div class="width-100 uppercase">last attack <span class="last-attack-needs">needing {{ combat.lastAttack.toHit }}</span></div>
                                   <unit-icon :unit="lastAttackUnit" noSelect="true" :classes="`faction-${combat.lastAttack.faction} mr-3`"></unit-icon>
                                    <img v-for="roll in combat.lastAttack.rolls"
                                         class="view-combat__last-attack-roll"
                                         :class="{'saturate-0' : roll < combat.lastAttack.toHit}"
                                         :src="`/images/icons/attack-${roll}.png`">
                                </div>
                            </div>


                            <div class="view-combat__body area-zoom__body p-4 pos-relative grow-1 flex-center flex-column flex-wrap">
                                <div v-for="faction in combat.factions" class="unit-row flex-center flex-wrap">
                                    <unit-combat v-for="unit in faction.units"
                                               :key="unit.id"
                                               :unit="unit">
                                    </unit-combat>
                                </div>
                           </div>

                     </div>
                 </div>
            </div>
         </div>
     </div>
 </transition>
</template>


<script>
 export default {

     name: 'view-combat',
     data() {
         return {
             shared : App.state,
             open : true,
         };
     },

     watch : {
         combat(){
             if( this.combat ) this.open = true;
         }
     },

     computed : {
         area(){
             return this.shared.data.areas[this.combat.areaName];
         },
         combat(){
             return this.shared.data.combat;
         },
         lastAttackUnit(){
             if( ! this.combat.lastAttack ) return;
             return this.shared.data.factions[this.combat.lastAttack.faction].units.find(
                 unit => unit.id === this.combat.lastAttack.unit
             );
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
 .view-combat {
     background-image : url('/images/factory-background.jpg');
     background-position: center;
     background-size: cover;
     z-index: 2;
     font-size: 1.4rem;
     color: var(--primary-light-color);
     transition: transform .2s;
 }

 .last-attack-needs {
     font-size: .7em;
     color: var(--primary-light-color);
     position: relative;
     bottom: .15em;
     left: .2rem;
 }

 .view-combat__last-attack {
     color: var(--highlight-color);
     background-image: url(/images/background-blurred.jpg);
     background-position: center;
     background-size: cover;
     background-repeat: no-repeat;
     border-radius: 1rem;
     border: 1px solid white;
     box-shadow: 0 0 0.5rem 0.2rem black;
     padding: .5rem;
     top: 40%;
 }

 .view-combat__last-attack .unit-hud__unit-image {
     border: 2px solid;
     box-shadow: 0 0 .4rem .2rem black;
 }

.view-combat__last-attack-roll{
    width: 4.55rem;
    margin: 0 .1rem;
}

 .view-combat__header {
     width: 100%;
     background-size: cover;
     background-position: center bottom;
     background-repeat: no-repeat;
     min-height: 9rem;
 }

 .view-combat__body {
     min-height: 28rem;
     padding-top: 0;
 }

 .view-combat.closed {
     transform: translate(-100%,0);
 }

 .view-combat .minimize-toggle {
     font-size: 1rem;
     padding: .75rem;
 }

 .view-combat.closed .minimize-toggle {
     transform: translate(100%,0);
 }

</style>

