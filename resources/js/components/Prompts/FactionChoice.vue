<template>
    <div :class="{
            active : selected === faction.name,
            taken : faction.owner !== null || faction.unselectable,
            killer : faction.killer,
            basic : faction.basic
            }"
         @click="$emit( 'clicked', faction.name )"
         class="choose-factions__faction pointer d-flex justify-end align-center">
        {{ faction.name }}<span class="choose-factions__status pl-3" :class="`choose-factions__status-${faction.status}`"></span>
        <span class="choose-factions__circle pl-1" :class="faction.name === selected ? 'icon-circle' : 'icon-circle-open'"></span>
    </div>
</template>


<script>
    export default {

        name: 'faction-choice',
        props: ['faction', 'selected'],

        data() {
            return {
                shared : App.state
            };
        }
    }
</script>


<style>

</style>

