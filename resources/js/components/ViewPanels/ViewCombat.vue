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

                        <div v-if="combat.attackBonus" class="highlight px-4 pt-0 pb-4">All units gain +{{ combat.attackBonus }} to their attacks</div>

                        <div class="faction-list">
                            <combat-faction v-for="faction in factions"
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
                                <last-attack :attack="combat.lastAttack"></last-attack>
                            </div>


                            <div class="view-combat__body area-zoom__body p-4 pos-relative grow-1 flex-center flex-column flex-wrap">
                                <div v-for="faction in factions" class="unit-row flex-center flex-wrap">
                                    <unit-combat v-for="unit in faction.units"
                                               :key="unit.id"
                                               :unit="unit">
                                    </unit-combat>

                                    <unit-combat v-if="hasSmoke( faction )"
                                                 :unit="{ type : 'smoke', faction: 'ninjas', name: 'smoke' }">
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

        factions(){
             if( !this.combat.preCombatEffects ) return this.combat.factions;

             let factions = [];

             Object.values( this.shared.data.factions ).forEach( faction => {


                 let units = faction.units.filter( unit => _.unitInArea( unit, this.combat.areaName ) );
                 console.log( 'units', units );

                 if( units.length ){
                     factions.push({
                         name : faction.name,
                         units : units,
                         mods : []
                     });
                 }
             });

             return factions;
        }
     },

     methods : {

         factionIcon( factionName ){
             return _.factionIcon( factionName );
         },

         hasSmoke( fac ){
             let faction = this.shared.data.factions[ fac.name ];
             return faction.smokeAreas && faction.smokeAreas.includes( this.combat.areaName );
         }

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
     transition: transform .3s;
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

