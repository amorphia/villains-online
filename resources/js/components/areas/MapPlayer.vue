<template>

        <div v-if="unitStats.length > 0 || Object.keys(statusIcons).length > 0" class="map-player__content flex-center m-1" :class="`faction-${name}`">
            <!-- player icon -->
            <div class="map-player__icon"><img :src="`/images/factions/${name}/icon.jpg`"></div>

            <!-- units -->
            <div v-for="unitType in unitStats" class="map-player__stat">

                <!-- count -->
                <span>{{ unitType.val }}</span>

                <!--  champion -->
                <i v-if="unitType.name === 'champion'" class="map-player_champion-wrap">
                    <img class="map-player__champion" :src="`/images/factions/${name}/portrait.png`">
                    <div v-if="unitType.pipped > 0" class="pos-absolute map-player__pips d-flex justify-center width-100" >
                        <i v-for="n in unitType.pipped" class="icon-circle" :class="`faction-${name}`"></i>
                    </div>
                </i>

                <!-- other units -->
                <i v-else :class="`icon-${unitType.name}`" class="pos-relative" :title="unitType.description">
                    <div v-if="unitType.pipped > 0" class="pos-absolute map-player__pips d-flex justify-center width-100" >
                        <i v-for="n in unitType.pipped" class="icon-circle" :class="`faction-${name}`"></i>
                    </div>
                </i>
            </div>

            <!-- status icons -->
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

                // abilities that have their own icon
                abilityIcons : [
                    'deadly',
                    'hidden',
                    'charged'
                ],

                // some status effects should always be pipped, even if the unit isn't flipped over
                // if a unit has any of the following properties we will always show them pipped
                alwaysShowPips : [
                    'vampire'
                ]
            };
        },

        methods : {
            /**
             * Should this unit show a pip even if its not flipped?
             * @param unit
             * @returns {boolean}
             */
            unitHasAlwaysShowPip( unit ){
                return this.alwaysShowPips.some( property => unit[property] === true );
            },

            unitShowPipWhenReady( unit ){
                return unit.ready && this.faction.showReadyPips;
            },
            /**
             * Create a tally of our standard units in this area
             * @returns {object} // { unitType : { count : {number}, pipped : {number} }, etc... }
             */
            tallyStandardUnits(){

                return this.unitsInArea.reduce( ( units, unit ) => {

                        // if this unit is webbed, count it separately
                        if( unit.webbed ){
                            if( units.web  ) units.web.count++;
                            else units.web = { count : 1, pipped : 0 };

                            return units;
                        }

                        // increment our count if this type already exists,
                        // otherwise add this unit type to our results
                        if( units[unit.type]  ) units[unit.type].count++;
                        else units[unit.type] = { count : 1, pipped : 0 };

                        // if the unit is flipped show a pip, or if this unit should always show a pip
                        if( unit.flipped
                            || this.unitHasAlwaysShowPip( unit )
                            || this.unitShowPipWhenReady( unit )
                        ) units[ unit.type ].pipped++;

                        return units;
                    }, {});
            },


            /**
             * Add our plants to our units tally
             * @returns {object} // { plants : { count : {number}, pipped : 0 }, etc... }
             */
            tallyPlants( units ){
                if( !this.plantsInArea ) return units;

                // add our plants count
                units['plant'] = { count : this.plantsInArea, pipped : 0 };
                return units;
            },


            /**
             * Add our ghosts to our units tally
             * @returns {object} // { unitType : { count : {number}, pipped : {number} }, etc... }
             */
            tallyGhosts( units ){
                if( !this.ghostsInArea.length ) return units;

                // add our plants count
                units['ghost'] = { count : this.ghostsInArea.length, pipped : 0 };
                return units;
            }
        },

        computed: {
            /**
             * Return this player's faction name, or neutral if we are showing the neutral faction
             * @returns {string|*}
             */
            name(){
                if( this.neutral ) return 'neutral';
                return this.faction.name;
            },


            /**
             * Returns a tally of this faction's units and assorted unit like things
             * @returns {object}
             */
            units(){
                if( !this.faction ) return {};

                // tally our standard units
                let units = this.tallyStandardUnits();

                // add in our plants
                units = this.tallyPlants( units );

                // add in our ghosts
                units = this.tallyGhosts( units );

                return units;
            },


            /**
             * Returns an array of this faction's unit in this area
             * @returns {Unit[]}
             */
            unitsInArea(){
                return this.faction.units.filter( unit => _.unitInArea( unit, this.area.name ) );
            },


            /**
             * Returns the number of plants this faction has in this area
             * @returns {number}
             */
            plantsInArea(){
                if( this.faction.name !== 'plants' ) return 0;
                return this.faction.plants[this.area.name];
            },


            /**
             * Returns an array of the ghost units this player has in the area
             * @returns {Unit[]}
             */
            ghostsInArea(){
                return [];
                //if( !this.faction.ghostDeploy ) return [];
                //return this.faction.ghosts.filter( unit => unit.location === this.area.name );
            },


            /**
             * Generate our unit status effects icon object
             * @returns {{}}
             */
            statusIcons(){
                if( this.neutral ) return {};

                let status = {};

                for( let unit of this.unitsInArea ) {
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

                if(this.faction.trappedAreas && this.faction.trappedAreas.includes(this.area.name)){
                    status['boobyTrapped'] = 'has been booby trapped'
                }

                if(this.faction.tunnels && this.faction.tunnels.includes(this.area.name)){
                    status['tunnel'] = 'has been tunneled to'
                }

                return status;
            },


            /**
             * Build our unit stats array
             * @returns {object[]}
             */
            unitStats(){
                if( this.neutral ) return [ { name: 'influence', val : 1 }];

                let unitStats = [];
                _.forEach( this.units, (unit, type) => {
                    unitStats.push({ name : type, val : unit.count, pipped : unit.pipped, description : `${type}s` });
                });
                return unitStats;
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

