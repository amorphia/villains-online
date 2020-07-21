<template>

        <div v-if="stats.length > 0" class="map-player__content flex-center m-1" :class="`faction-${name}`">
            <div class="map-player__icon"><img :src="`/images/factions/${name}/icon.jpg`"></div>
            <div v-for="stat in stats" class="map-player__stat">
                <span v-if="stat.name !== 'champion'  && stat.val > 0 || stat.val > 1">{{ stat.val }}</span>
                <img v-if="stat.name === 'champion'" class="map-player__champion" :src="`/images/factions/${name}/portrait.png`">
                <i v-else :class="`icon-${stat.name}`" :title="stat.description"></i>
            </div>
            <div v-for="(desc, icon) in statusIcons" class="map-player__stat" :title="desc">
                <img class="map-player__champion" :src="`/images/icons/${icon}.png`">
            </div>
        </div>
</template>


<script>
    export default {

        name: 'map-player',
        props :['neutral','area','faction'],
        data() {
            return {
                shared : App.state,
            };
        },

        computed: {
            name(){
                if( this.neutral ) return 'neutral';
                return this.faction.name;
            },

            units(){
                if( !this.faction ) return [];
                return this.shared.groupByCount( this.faction.units.filter( unit => _.unitInArea( unit, this.area ) ), 'type' );
            },


            kills(){
                if( !this.faction ) return 0;
                return _.killsInArea( this.faction, this.area, this.shared.data.factions );
            },


            statusIcons(){
                if( this.neutral ) return {};

                let status = {};

                for( let unit of this.faction.units ) {
                    if (unit.location !== this.area.name || unit.killed) continue;

                    if (unit.ready) status['skilled'] = 'has ready units';

                    if (unit.toughness && unit.flipped) status['toughness'] = 'has wounded units';

                    //if (!unit.toughness && unit.flipped) status[this.faction.statusIcon] = this.faction.statusDescription;

                    if( unit.firstStrike ) status['first-strike'] = 'has units with first strike';

                    if (unit.token) status['xavier-token'] = 'Xavier Blackstone has a token placed on him';
                }

                return status;
            },

            stats(){
                if( this.neutral ) return [ { name: 'influence', val : 1 }];


                let stats = [];

                _.forEach( this.units, (count, type) => {
                    stats.push({ name : type, val : count, description : `${type}s` });
                });


                return stats;
            }
        }
    }
</script>


<style>

 .icon-color-skill:before {
     content: "";
     width: 1em;
     height: 1em;
     background-image: url(/images/icons/skilled.png);
     display: block;
     background-position: center;
     background-size: cover;
 }

 .map-player {
     margin-bottom: .1em;
 }

 .map-player__content {
     background-color: rgba(0,0,0,.75);
     border-radius: .2em;
     padding: .25em;
     font-size: 1.5rem;
     display: inline-flex;
 }

 .map-player__content i {
     font-size: .9em;
 }

 .map-player__content span {
     color: var(--highlight-color);
     height: .9em;
     padding: 0 .1em;
 }

 .map-player__stat {
     line-height: 1em;
     padding: 0 .1em;
     display: flex;
     align-items: center;
 }
.map-player__champion {
    width: .9em;
    height: .9em;
    margin-left: .1em;
}
 .map-player__icon {
     width: 1em;
     height: 1em;
     margin-right: .1em;
 }
</style>

