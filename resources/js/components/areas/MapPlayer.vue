<template>

        <div v-if="stats.length > 0" class="map-player__content flex-center m-1" :class="`faction-${name}`">
            <div class="map-player__icon"><img :src="`/images/factions/${name}/icon.jpg`"></div>
            <div v-for="stat in stats" class="map-player__stat">

                <span v-if="stat.name !== 'champion'  && stat.val > 0 || stat.val > 1">{{ stat.val }}</span>

                    <i v-if="stat.name === 'champion'" class="map-player_champion-wrap">
                        <img class="map-player__champion" :src="`/images/factions/${name}/portrait.png`">
                        <div v-if="stat.pipped > 0" class="pos-absolute map-player__pips d-flex justify-center width-100" >
                            <i v-for="n in stat.pipped" class="icon-circle" :class="`faction-${faction.name}`"></i>
                        </div>
                    </i>
                    <i v-else :class="`icon-${stat.name}`" class="pos-relative" :title="stat.description">
                        <div v-if="stat.pipped > 0" class="pos-absolute map-player__pips d-flex justify-center width-100" >
                            <i v-for="n in stat.pipped" class="icon-circle" :class="`faction-${faction.name}`"></i>
                        </div>
                    </i>



            </div>
            <div v-for="(desc, icon) in statusIcons" class="map-player__stat" :title="desc">
                <img class="map-player__status" :src="`/images/icons/${icon}.png`">
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
                abilityIcons : [
                    'deadly',
                    'hidden',
                    'charged'
                ],
                alwaysShowPips : [
                    'vampire'
                ]
            };
        },

        methods : {
            unitHasAlwaysShowPip( unit ){
                let pipped;

                this.alwaysShowPips.forEach( property => {
                    if( unit[property] ) pipped = property;
                });

                return pipped;
            }
        },

        computed: {
            name(){
                if( this.neutral ) return 'neutral';
                return this.faction.name;
            },

            units(){
                if( !this.faction ) return [];
                let units = {};

                this.faction.units.filter( unit => _.unitInArea( unit, this.area ) ).forEach( unit => {

                    if( units[ unit.type ] ){
                        units[ unit.type ].count++;
                    } else {
                        units[ unit.type ] = { count : 1, pipped : 0 };
                    }

                    if( unit.flipped || this.unitHasAlwaysShowPip( unit ) ) units[ unit.type ].pipped++;
                });

                // show plants
                if( this.faction.name === 'plants' && this.faction.plants[this.area.name] ){
                    for( let i = 0; i < this.faction.plants[this.area.name]; i++ ){
                        if( units['plant'] ){
                            units['plant'].count++;
                        } else {
                            units['plant'] = { count : 1, pipped : 0 };
                        }
                    }
                }

                // show ghosts
                if( this.faction.name === 'ghosts' ){
                    let areaGhosts = this.faction.ghosts.filter( unit => unit.location === this.area.name );

                    for( let i = 0; i < areaGhosts.length; i++ ){
                        if( units['ghost'] ){
                            units['ghost'].count++;
                        } else {
                            units['ghost'] = { count : 1, pipped : 0 };
                        }
                    }
                }

                return units;
            },


            kills(){
                if( !this.faction ) return 0;
                return _.killsInArea( this.faction, this.area, this.shared.data.factions );
            },


            statusIcons(){
                if( this.neutral ) return {};

                let status = {};
                let factionUnits = this.faction.units.filter( unit => _.unitInArea( unit, this.area.name ) );

                for( let unit of factionUnits ) {
                    // is this unit skilled and ready?
                    if ( _.canUseSkill( this.faction, this.area, this.shared.data.factions ) ) status['skilled'] = 'can activate area skill';

                    // is this unit wounded
                    if (unit.toughness && unit.flipped) status['toughness'] = 'has wounded units';

                    // does this unit have a faction specific flipped status
                    if (!unit.toughness && unit.flipped && this.faction.statusIcon){
                        status[this.faction.statusIcon] = this.faction.statusDescription;
                    }

                    // does this unit have a status effect that we have in our "Always show pip" array?
                    let unitHasAlwaysShowPip = this.unitHasAlwaysShowPip( unit );
                    if ( unitHasAlwaysShowPip && this.faction.statusIcon ){
                        status[this.faction.statusIcon] = this.faction.statusDescription;
                    }

                    // does this unit have first strike (each faction has its own color first strike icon)
                    if( unit.firstStrike ) status[`${unit.faction}-first-strike`] = 'has units with first strike';

                    // does xavier have a token on him?
                    if (unit.token) status['xavier-token'] = 'Xavier Blackstone has a token placed on him';

                    // cycle through the basic unit abilities
                    this.abilityIcons.forEach( ability => {
                        if( unit[ability] ) status[ability] = `has a ${ability} unit`;
                    });

                }

                return status;
            },

            stats(){
                if( this.neutral ) return [ { name: 'influence', val : 1 }];

                let stats = [];


                _.forEach( this.units, (unit, type) => {
                    stats.push({ name : type, val : unit.count, pipped : unit.pipped, description : `${type}s` });
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
     padding: .3em .25em .3em .25em;
     font-size: 1.5rem;
     display: inline-flex;
 }

 .map-player__content i {
     font-size: .9em;
 }

 .map-player_champion-wrap {
     width: .9em;
     height: .9em;
     position: relative;
     margin-left: .1em;
 }

 .map-player__pips {
     bottom: -.2em;
 }

 .map-player_champion-wrap .map-player__pips {
     bottom: -.3em;
 }

 .map-player__pips i {
     font-size: .2em;
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
     position: relative;
 }

.map-player__champion, .map-player__status {
    width: .9em;
    height: .9em;
}

 .map-player__champion {

 }

 .map-player__icon {
     width: 1em;
     height: 1em;
     margin-right: .1em;
 }

</style>

