<template>
    <player-prompt classes="">
        <div class="min-prompt-width px-5">
            <div class="width-100 d-flex justify-center flex-column align-center">
                <!-- title -->
                <div class="title" v-html="message"></div>

                <!-- area -->
                <area-flipper :areas="areas" :index="index" @update="updateArea">
                    <unit-row v-for="(set, name) in units"
                              :units="set"
                              :key="name"
                              :classes="shouldSetOpacity( name )"
                              @unit="selectFaction"></unit-row>
                </area-flipper>

                <!-- attack modification text -->
                <div v-if="attackMod" class="prompt-question">Your units get {{ attackMod >= 0 ? '+' : '' }}{{ attackMod }} to their rolls against the {{ faction }}</div>

                <!-- buttons -->
                <div>
                    <button v-if="data.optional" class="button button-empty" @click="resolve( false )">DECLINE</button>
                    <button class="button" :disabled="!faction" @click="resolve( true )">SELECT VICTIM</button>
                </div>
            </div>
        </div>
    </player-prompt>
</template>


<script>
    export default {

        name: 'choose-victim',

        data() {
            return {
                shared : App.state,
                index : 0,
                faction : null
            };
        },

        computed : {

            /**
             * Calculate our attack modifier
             * @returns {number}
             */
            attackMod(){
                if( !this.faction || !this.data.unitAttack ) return 0;

                let targetFaction = this.shared.data.factions[ this.faction ];
                let defenseBonus = _.calculateDefenseBonus( this.shared.faction, targetFaction, this.area );
                let factionAttackBonus = this.shared.faction.attackBonus ?? 0;
                let combatAttackBonus = this.data.attackBonus ?? 0;

                return combatAttackBonus + factionAttackBonus - defenseBonus;
            },


            /**
             * Return our potential victims units
             */
            units(){
                let units = {};

                _.forEach( this.shared.data.factions, faction => {
                    // ignore our own units unless permitted
                    if( faction.name === this.data.faction && !this.data.allowSelf ) return;

                    // abort if we can only target certain factions
                    if( this.data.targetFactions
                        && this.data.targetFactions.length
                        && !this.data.targetFactions.includes( faction.name ) ) return;

                    // get this faction's units and add them to our results
                    let factionUnits = _.factionUnitsInArea( faction, this.area.name, { notHidden : true } );
                    if( factionUnits.length ){
                        units[faction.name] = factionUnits;

                        // if this faction has smoke in the area, add it
                        if( faction.smokeAreas && faction.smokeAreas.includes( this.area.name ) ){
                            units[faction.name].push({ name: 'smoke', type: 'smoke', faction: 'ninjas' });
                        }
                    }
                });

                return units;
            },


            /**
             * Get our title message
             * @returns {string}
             */
            message(){
                return this.data.message ? this.shared.filterText( this.data.message ) : 'Choose your victim'
            },


            /**
             * Return our area object
             * @returns {Area}
             */
            area(){
                return this.shared.data.areas[ this.currentAreaName ];
            },


            /**
             * Get our current area name
             * @returns {string}
             */
            currentAreaName(){
                return this.data.areas[this.index];
            },


            /**
             * Return an array of our area objects
             * @returns {Area[]}
             */
            areas(){
                return this.data.areas.map( areaName => this.shared.data.areas[areaName] );
            },


            /**
             * Return our prompt data
             * @returns {object}
             */
            data(){
                return this.shared.player.prompt.data;
            },

        },

        methods : {

            /**
             * Select the currently selected faction's units
             */
            selectCurrentFactionUnits(){
                _.forEach( this.units, (units, name) => {
                    units.forEach( unit => this.$set( unit, 'selected', name === this.faction ) );
                });
            },


            /**
             * Select a faction based on the unit clicked
             * @param unit
             */
            selectFaction( unit ){
                this.faction = this.faction !== unit.faction ? unit.faction : null;
                this.selectCurrentFactionUnits();
            },


            /**
             * Should we set this faction's opacity?
             * @param faction
             * @returns {string|null}
             */
            shouldSetOpacity( faction ){
                if( this.faction && this.faction !== faction ) return 'opacity-7';
            },


            /**
             * Resolve this prompt
             * @param val
             */
            resolve( val ){
                let data = this.getResolveData( val );
                data = { ...this.data, ...data };
                this.shared.respond( 'choose-victim', data );
            },


            /**
             * Get our resolve data
             *
             * @param val
             * @returns {object}
             */
            getResolveData( val ){
                // if we declined...
                if( !val ) return { declined : true };

                return {
                    area : this.area.name,
                    faction : this.faction
                }
            },


            /**
             * Update our selected area
             * @param index
             */
            updateArea( index ){
                if( index === this.index ) return;
                this.area.tokens.forEach( token => this.$set( token, 'selected', false ) );
                this.index = index;
            },

        }
    }
</script>

