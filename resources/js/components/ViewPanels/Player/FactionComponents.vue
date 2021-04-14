<template>
    <div class="view-player__side width-45 height-100 pt-4 pl-3 pb-6">

        <!-- faction sheet -->
        <div class="view-player__title">Faction Sheet:</div>
        <img :src="`/images/factions/${faction.name}/sheet.jpg`" class="my-5" >

        <!-- unit mix -->
        <div class="view-player__title mt-5">Unit Mix:</div>
        <div class="view-player__units d-flex mb-4 justify-center align-start">
            <div v-for="(count, type) in shared.groupByCount( faction.units, 'type' )"
                 class="view-player__token-wrap p-2 pos-relative d-flex flex-column">

                <!-- front side -->
                <div class="width-100 pos-relative ratio-square">
                    <div class="view-player__unit" :data-count="count" >
                        <img class="view-player__unit-image"
                             :src="`/images/factions/${faction.name}/units/${type}.png`">
                    </div>
                </div>

                <!-- flipped side -->
                <div v-if="faction.flipableUnits && faction.flipableUnits.includes( type )" class="width-100 pos-relative ratio-square">
                    <div class="view-player__unit">
                        <img class="view-player__unit-image"
                             :src="`/images/factions/${faction.name}/units/${type}-flipped.png`">
                    </div>
                </div>

            </div>
        </div>

        <!-- token mix -->
        <div class="view-player__title mt-5">Token Mix:</div>
        <div class="view-player__tokens d-flex mb-4 justify-center">
            <div v-for="(count, type) in shared.groupByCount( faction.tokens, 'name' )"
                 class="view-player__token-wrap p-2 ratio-square pos-relative">
                <div class="width-100 pos-relative height-100">
                    <div class="view-player__token" :data-count="count" >
                        <img class="view-player__token"
                             :src="`/images/factions/${faction.name}/tokens/${type}.png`">
                    </div>
                </div>
            </div>
        </div>

        <!-- upgrades -->
        <div class="view-player__title mt-5">Upgrades:</div>
        <div class="view-player__upgrades d-flex justify-center">
            <div class="view-player__upgrade-card width-50 p-3">
                <img class="view-player__upgrade-card-image" :src="`/images/factions/${faction.name}/upgrade-1.jpg`">
            </div>
            <div class="view-player__upgrade-card width-50 p-3">
                <img class="view-player__upgrade-card-image" :src="`/images/factions/${faction.name}/upgrade-2.jpg`">
            </div>
        </div>

        <!-- plans -->
        <div class="view-player__title mt-5">Plans:</div>
        <div class="view-player__upgrades d-flex flex-wrap">
            <div class="width-50 p-3" v-for="index in 8">
                <img class="width-100 radius-1" :src="`/images/factions/${faction.name}/plans/${index}.jpg`">
            </div>
        </div>

    </div>
</template>


<script>
    export default {

        name: 'faction-components',
        props : ['faction'],

        data() {
            return {
                shared : App.state
            };
        },
    }
</script>

