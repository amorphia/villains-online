let mixin = {

    /**
     *
     * GAME
     *
     */

    /**
     * Return our game instance
     *
     * @returns {Game}
     */
    game(){
        return Server.games[this.gameId];
    },


    /**
     * Return our player instance
     *
     * @returns {Player}
     */
    getPlayer(){
        return this.game().players[this.playerId];
    },


    /**
     * Get our player order
     *
     * @returns {number}
     */
    playerOrder(){
        return _.indexOf( this.game().data.playerOrder, this.playerId );
    },


    /**
     *
     *
     *  VICTORY
     *
     */


    /**
     * Have we achieved victory
     *
     * @returns {boolean}
     */
    hasVictory(){
        return this.data.ap >= this.game().data.maxAP || this.data.pp >= this.game().data.maxPP;
    },


    /**
     * What turn did we capture our last captiol token?
     *
     * @returns {number}
     */
    lastCapitolToken(){
        if( this.data.capitolTokens.length ){
            return _.last( this.data.capitolTokens ).turn;
        }

        return 0;
    },


    /**
     *
     * AREAS
     *
     */


    /**
     * Returns an array of area names matching the areas we control
     *
     * @returns {string[]}
     */
    areas() {
        return Object.values( this.game().areas )
            .filter( area => area.data.owner === this.name )
            .map( area => area.name );
    },


    /**
     * Does this faction control the given area?
     *
     * @param area
     * @returns {boolean}
     */
    controlsArea( area ){
        if( typeof area !== 'string' ) area = area.name;
        return this.areas().includes( area );
    },


    /**
     * Returns an array of area names with enemy units in them
     *
     * @param args
     * @param adjacentToArea
     * @returns {Array}
     */
    areasWithEnemyUnits( args = {}, adjacentToArea = null ){
        let areas = [];

        // cycle through each game faction looking for areas where each enemy player has units
        Object.values( this.game().factions ).forEach( faction => {
            // enemy units only
            if( faction.name === this.name ) return;
            // get this faction's areas with units
            areas = _.union( areas, faction.areasWithUnits( args ) );
        });

        // if we need to filter by adjacent areas do so here
        if( adjacentToArea ) areas = this.filterAreasArrayByAdjacentArea( adjacentToArea, areas );

        if( args.noCeaseFire ) areas = this.filterAreasByCeaseFire( areas );

        return areas;
    },


    /**
     * Filter an array of area names to only include areas adjacent to the given area
     *
     * @param adjacentArea
     * @param areas
     */
    filterAreasArrayByAdjacentArea( adjacentArea, areas ){
        if( typeof adjacentArea === 'string' ) adjacentArea = this.game().areas[adjacentArea];
        return _.intersection( areas, adjacentArea.data.adjacent );
    },


    /**
     * Filter an array of area names to remove any areas where cease fire is active
     *
     * @param areas
     * @returns {array}
     */
    filterAreasByCeaseFire( areas ){
        return areas.filter( area => {
            let areaObj = this.game().areas[area];
            return !areaObj.hasCard( 'cease-fire' );
        });
    },

    /**
     * Returns an array of area names that this faction has units who can attack in
     *
     * @returns {string[]}
     */
    areasWithAttackingUnits(){
        let areas = this.areasWithUnits( { attacks : true } );
        return this.filterAreasWhereOurUnitsCantAttack( areas );
    },


    /**
     * Filter an area list to remove areas where this faction could not make an attack
     *
     * @param areas
     * @returns {string[]}
     */
    filterAreasWhereOurUnitsCantAttack( areas ){
        return areas.filter( areaName => {
            let area = this.game().areas[ areaName ];
            let hasCeaseFire = area.hasCard( 'cease-fire' );
            let attackableUnitsInArea = _.factionsWithUnitsInArea( this.game().data.factions, areaName, { exclude : this.name, notHidden : true } ).length > 0;
            return !hasCeaseFire && attackableUnitsInArea;
        });
    },


    /**
     * Return a list of areas with our dead units in them
     *
     * @returns {[]}
     */
    areasWithDeadUnits(){
        return _.factionAreasWithDead( this );
    },


    /**
     * Are there any enemy units in this area?
     *
     * @param area
     * @param options
     * @returns {boolean}
     */
    hasEnemyUnitsInArea( area, options = {} ){
        let enemyUnits = this.enemyUnitsInArea( area, options );
        return Object.keys( enemyUnits ).length > 0;
    },


    /**
     *
     * @param area
     * @param options
     * @returns {string[]}
     */
    enemyUnitTypesInArea( area, options = {} ){
        let types = {};
        let enemyUnits = this.enemyUnitsInArea( area, options );

        Object.values( enemyUnits ).forEach( factionUnits => {
            factionUnits.forEach( unit =>  {
                types[unit.type] = true;
            });
        });

        return Object.keys( types );
    },


    /**
     * Returns the enemy units in this area
     *
     * @param area
     * @param options
     * @returns {object} // returns an object with the structure { factionOne : [units], factionTwo : [units], ect... }
     */
    enemyUnitsInArea( area, options = {} ){
        return _.enemyUnitsInArea( this.data, area.name, this.game().data.factions, options );
    },


    /**
     * Returns an array of areaNames matching the areas where we have units
     *
     * @param options
     * @returns {string[]}
     */
    areasWithUnits( options = {} ){
        return _.areasWithUnits( this, options );
    },


    /**
     * Returns the count of total enemy units in areas this faction controls
     *
     * @returns {number}
     */
    enemyUnitsInOurAreasCount(){
        return _.factionEnemyInAreasCount( this.data, this.game().data.factions, this.game().data.areas );
    },


    /**
     * Does this faction have units in the given area?
     *
     * @param area
     * @param options
     * @returns {boolean}
     */
    hasUnitsInArea( area, options = {} ) {
        return _.factionHasUnitsInArea( this.data, area, options );
    },


    /**
     * Returns an array of this faction's units in a given area
     *
     * @param area
     * @param options
     * @returns {units[]}
     */
    unitsInArea( area, options = {} ) {
        return _.factionUnitsInArea( this, area, options );
    },


    /**
     * Returns how much influence this faction has in a given area
     *
     * @param area
     * @returns {number}
     */
    influenceInArea( area ){
        return _.influence( this, area, this.game().data.factions );
    },


    /**
     * Returns the area instance of this faction's target for the turn
     *
     * @returns {Area}
     */
    targetArea(){
        let areaName = this.data.cards.target[0].target;
        return this.game().areas[areaName];
    },


    /**
     * Return the name of this faction's target for the turn
     *
     * @returns {*}
     */
    targetName(){
       return this.data.cards.target[0].target;
    },


    /**
     * Has this faction exterminated the given area?
     *
     * @param area
     * @returns {boolean}
     */
    hasExterminatedArea( area ){
        if( typeof area === 'string' ) area = this.game().data.areas[area];
        return _.areaExterminated( area, this.game().data.factions ) === this.name;
    },


    /**
     * Return the total number of units this faction has killed
     *
     * @returns {number}
     */
    totalKills() {
        return Object.values( this.game().factions ).reduce( (kills, faction) => {
            if(faction.name === this.name) return kills; // skip our own units

            // count up our kills
            kills += faction.data.units.filter( unit => unit.killed === this.name ).length;
            return kills;
        }, 0 );
    },


    /**
     * Does this faction have a revealed biohazard token in the area?
     *
     * @param area
     * @returns {boolean}
     */
    hasBiohazardInArea( area ){
        return _.hasBiohazardInArea( this, area );
    },


    /**
     * Returns a count of the areas where we have the most units
     *
     * @returns {number}
     */
    areasMostUnits(){
        return _.areasMostUnits( this, this.game().data.factions ).length;
    },


    /**
     * Returns a count of the number of areas where we have the most tokens
     *
     * @returns {number}
     */
    areasWithMostTokens(){
        return _.factionAreasWithMostTokens( this, this.game().data.areas );
    },


    /**
     * Return an array of faction names who have units in the given area
     *
     * @param area
     * @param options
     * @returns {string[]}
     */
    enemiesWithUnitsInArea( area, options = {} ){
        let enemies = [];
        for( let faction of Object.values( this.game().data.factions ) ){
            if( faction.name !== this.name && _.factionHasUnitsInArea( faction, area, options ) ) enemies.push( faction.name );
        }
        return enemies;
    },


    /**
     *
     *
     *  Skills
     *
     */


    /**
     * Have we used the given area's skill?
     *
     * @param area
     * @returns {boolean}
     */
    hasUsedSkill( area ){
        return _.hasUsedSkill( this, area );
    },


    /**
     * Can we activate the given area's skill?
     *
     * @param area
     * @returns {boolean}
     */
    canUseSkill( area ){
        return _.canUseSkill( this, area, this.game().data.factions );
    },


    /**
     *
     * UNITS
     *
     */


    /**
     * Return an array of units we have in play
     *
     * @returns {*}
     */
    unitsInPlay( options = {} ) {
        return _.unitsInPlay( this, options );
    },


    /**
     * Return an array of unit types we have in play
     *
     * @param basicOnly
     * @returns {string[]}
     */
    unitTypesInPlay( basicOnly ){
        let types = {};
        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit, { basic : basicOnly } ) ) types[unit.type] = true;
        });
        return Object.keys( types );
    },


    /**
     * Return an array of unit types we have in our reserves
     *
     * @param basicOnly
     * @returns {string[]}
     */
    unitTypesInReserves( basicOnly ){
        let types = {};

        this.data.units.forEach( unit => {
           if( _.unitInReserves( unit, { basic : basicOnly } ) ) types[unit.type] = true;
        });

        return Object.keys( types );
    },


    /**
     * Return an array of units in our reserves
     *
     * @param options
     * @returns [units]
     */
    unitsInReserves( options = {} ){
        return this.data.units.filter( unit => _.unitInReserves( unit, options ) );
    },

    /**
     * Do we have a unit of the given type in the given area?
     *
     * @param type
     * @param area
     * @returns {boolean}
     */
    typeInArea( type, area ){
        return this.data.units.some( unit => _.unitInArea( unit, area, { type : type } ) );
    },


    /**
     * Is our champion in the given area?
     *
     * @param area
     * @returns {*}
     */
    championInArea( area ){
        return this.data.units.some( unit => _.unitInArea( unit, area, { type : 'champion' } ) );
    },


    /**
     * Returns our champion unit
     *
     * @returns {Unit}
     */
    getChampion(){
        return this.data.units.find( unit => unit.type === 'champion' );
    },


    /**
     * Returns our champion unit, if it is in play
     *
     * @returns {unit|undefined}
     */
    getChampionInPlay(){
        return this.data.units.find( unit => _.unitInPlay( unit, { type : 'champion' } ) );
    },


    /**
     * Returns an array of the units in our reserves
     *
     * @returns {Unit[]}
     */
    reserves(){
        return this.data.units.filter( unit => !unit.location );
    },


    /**
     * Returns an array of our units that are dead
     *
     * @returns {Unit[]}
     */
    dead(){
        return this.data.units.filter( unit => unit.killed );
    },


    /**
     * Returns an array of area names where we have scored at least one kill
     *
     * @returns {string[]}
     */
    areasWithKills(){
        return _.factionAreasWithKills( this, this.game().data.factions );
    },


    /**
     * Returns an array of the units we have killed
     *
     * @returns {Unit[]}
     */
    kills(){
        return _.factionKills( this, this.game().data.factions );
    },


    /**
     * Returns an object tallying the amount of each unit type killed
     *
     * @returns {object} // structured { typeOne : {number}, typeTwo: {number}, etc... }
     */
    unitTypesKilled(){
        return _.factionTypesKilled( this, this.game().data.factions );
    },


    /**
     * Returns an array of units we have killed in enemy areas
     *
     * @returns {Unit[]}
     */
    killsInEnemy(){
        return _.factionKillsInEnemy( this, this.game().data.factions, this.game().data.areas );
    },


    /**
     * Returns the number of kills we have in the given area
     *
     * @param area
     * @returns {number}
     */
    killsCountIn( area ){
        return _,factionKillCountInArea( this.name, area, this.game().data.factions );
    },


    /**
     * Did we kill the given unit in the given area?
     *
     * @param unit
     * @param area
     * @returns {boolean}
     */
    killedUnitHere( unit, area ){
        return _.factionKilledUnitHere( this, unit, area );
    },



    /**
     *
     * MONEY
     *
     */


    /**
     * Returns the total amount of resources + energy we have to spend
     *
     * @returns {number}
     */
    money(){
        return this.data.resources + this.data.energy;
    },

    /**
     * Returns the number of cards in hand
     *
     * @returns {number}
     */
    cardCount(){
        return this.data.cards.hand.length;
    },


    /**
     * Returns the number of resources we are entitled to collect during the collect resources step
     *
     * @returns {number}
     */
    resourcesToCollect(){
        let areas = this.areas();
        //let resources = areas.length;
        //if( areas.includes( 'bank' ) ) resources++;
        return areas.length;
    },


    /**
     * Returns an array of area names for the areas we have exterminated, optionally
     * filtering out any areas that aren't a target
     *
     * @param {boolean} targetOnly // should we include target areas only?
     * @returns {string[]}
     */
    areasExterminated( targetOnly = false ){
        let areas = [], targets = [];

        // if we are filtering by targets, make an array of valid target areas
        if( targetOnly ){
            targets = Object.values( this.game().factions )
                .map( faction => faction.targetName() )
                .filter( item => item ); // get rid of false values
        }

        // create our array of area names
        _.forEach( this.game().areas, area => {
            let areaExterminatedBy = _.areaExterminated( area, this.game().data.factions );
            if( areaExterminatedBy === this.name
                && (!targetOnly || targets.includes( area.name ) )
            ) areas.push( area.name );
        });

        return areas;
    },


    /**
     * Returns the number of areas where we have the given minimum influence
     *
     * @param influenceCount
     * @returns {number}
     */
    areasWithMinInfluence( influenceCount ){
        return Object.values( this.game().areas ).reduce( (areasWithMinInfluence, area ) => {
            if( this.influenceInArea( area ) >= influenceCount ) areasWithMinInfluence++;
            return areasWithMinInfluence;
        }, 0 );
    },


    /**
     * Returns the number players where we have killed at least x units
     *
     * @param killCount
     * @returns {number}
     */
    enemiesWithMinKills( killCount ){

        let kills = _.factionKillsPerEnemy( this, this.game().data.factions );

        return Object.values( kills ).reduce( (factionWithMinKills, factionKills ) => {
            if( factionKills >= killCount ) factionWithMinKills++;
            return factionWithMinKills;
        }, 0 );
    },

    /**
     *
     * COMBAT
     *
     */


    /**
     * Generate an array of basic combat modifiers
     *
     * @param area
     * @returns {object[]}
     */
    combatModifiersList( area ){
        let mods = [];

        // attack bonus
        if( this.data.attackBonus ) mods.push( { type : 'attackBonus', text : `Gains +${this.data.attackBonus} to attack rolls`, val : this.data.attackBonus });

        // unit type attack bonus
        if( this.data.unitTypeAttackBonus.length ){
            this.data.unitTypeAttackBonus.forEach( bonus => {
                if( this.typeInArea( bonus.type, area ) ){
                    mods.push( { type : 'attackBonus', text : `${bonus.from} grants +${bonus.value} to attack rolls with ${bonus.type}s`, val : bonus.value });
                }
            })
        }

        // defense bonus
        if( this.data.defenseBonus ) mods.push( { type : 'defenseBonus', text : `Enemies suffer -${this.data.defenseBonus} to their attack rolls`, val : this.data.defenseBonus });

        // bonus dice
        if( this.data.bonusDice ) mods.push( { type : 'bonusDice', text : `Units gain +${this.data.bonusDice} extra dice`, val : this.data.bonusDice });

        // add in any faction specific combat mods, then return the results
        return this.factionCombatMods( mods, area );
    },


    /**
     *
     * MISC
     *
     */


    /**
     * Does this faction have units in the given area?
     *
     * @param area
     * @param options
     * @returns {boolean}
     */
    tokensInArea( area, options = {} ) {
        if(area.name) area = area.name;
        return this.data.tokens.filter(token => {
            return token.location === area
                && (!options.type || token.type === options.type)
                && (!options.revealed || token.revealed)
                && (!options.unrevealed || !token.revealed);
        });
    },

    /**
     * Return's our player name
     *
     * @returns {string}
     */
    playerName(){
        let player = this.game().getPlayerByFaction( this.name );
        return player.data.name;
    },


    /**
     * Returns an object tallying how many rule action cards we've played this turn
     *
     * @returns {object} // { total : {number}, areas: {number}, stack : {number} }
     */
    rulesPlayed(){
        return _.rulesPlayed( this, this.game().data.areas );
    }
};

module.exports = mixin;
