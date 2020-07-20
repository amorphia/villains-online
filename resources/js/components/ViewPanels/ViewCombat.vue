<template>
    <transition name="right">
        <div v-if="shared.data.combat" class="view-combat pos-absolute width-100 height-100 p-5  overflow-auto z-4">

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

                        <div class="view-combat__header area-zoom__header p-4 pos-relative grow-0 shrink-0"></div>


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
 </transition>
</template>


<script>
 export default {

     name: 'view-combat',
     data() {
         return {
             shared : App.state,
         };
     },



     computed : {
         area(){
             return this.shared.data.areas[this.combat.areaName];
         },
         combat(){
             return this.shared.data.combat;
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



</style>

