let helpers = {

    /**
     * Checks if the given unit meets all of the filters in our options parameter
     *
     * @param unit
     * @param options
     * @returns {boolean}
     */
    isValidUnit( unit, options ){
        if( options.location && typeof options.location !== 'string' ) options.location = options.location.name; // format input

        return ( !options.killed || unit.killed )
            && ( !options.notKilled || !unit.killed )
            && ( !options.location || options.location == unit.location ) // intentionally coercive to match different falsy values
            && ( !options.adjacent || options.adjacent.includes( unit.location ) )
            && ( !options.onBoard || unit.location )
            && ( !options.inReserves || !unit.location )
            && ( !options.basic || unit.basic )
            && ( !options.notBasic || !unit.basic )
            && ( !options.flipped || unit.flipped )
            && ( !options.notFlipped || !unit.flipped )
            && ( !options.selected || unit.selected )
            && ( !options.notSelected || !unit.selected )
            && ( !options.canBeReplaced || !unit.noReplace )
            && ( !options.skilled || unit.skilled )
            && ( !options.notSkilled || !unit.skilled )
            && ( !options.ready || unit.ready )
            && ( !options.notReady || !unit.ready )
            && ( !options.isUnwounded || ( ( unit.toughness && !unit.flipped ) || unit.prepared ) )
            && ( !options.isWounded || (unit.toughness && unit.flipped) )
            && this.unitTypeTest( options, unit )
            && this.unitTypeInTest( options, unit )
            && this.unitNotTypeTest( options, unit )
            && ( !options.notChampion || !this.isChampion( unit ) )
            && ( !options.isChampion || this.isChampion( unit ) )
            && this.unitTypesTest( options, unit )
            && ( !options.hidden || unit.hidden )
            && ( !options.canCombat || (!unit.hidden || ( unit.attack.length && !unit.webbed ) ) )
            && ( !options.notWebbed || !unit.webbed )
            && ( !options.notHidden || !unit.hidden )
            && ( !options.deployable || ( !unit.noDeploy && !unit.webbed ) )
            && ( !options.deployableType || !unit.noDeploy )
            && ( !options.hasProp || unit[options.hasProp] )
            && ( ( !options.attacks && !options.withAttack ) || ( unit.attack.length && !unit.webbed ) );
    },

    unitTypeTest( options, unit ){
        if( !options.type ) return true;

        if( unit.type === options.type ) return true;

        if( !unit.additionalTypes ) return false;

        return unit.additionalTypes.includes( options.type );
    },

    unitTypesTest( options, unit ){
        if( !options.types ) return true;

        if( options.types.includes( unit.type ) ) return true;

        let typesIntersection = this.intersection( unit.additionalTypes ?? [], options.types );

        console.log("typesIntersection", typesIntersection);

        return typesIntersection.length > 0;
    },

    unitTypeInTest( options, unit ){
        if( !options.typeIn ) return true;

        if( options.typeIn.includes( unit.type ) ) return true;

        if( !unit.additionalTypes ) return false;

        return this.intersection( unit.additionalTypes, options.typeIn ).length > 0;
    },

    unitNotTypeTest( options, unit ){
        if( !options.notType ) return true;

        if( unit.type === options.notType ) return false;

        return !unit.additionalTypes?.includes( options.notType );
    },


    /**
     * Returns the given faction's units in play
     *
     * @param faction
     * @param options
     * @returns {Unit[]}
     */
    unitsInPlay( faction, options = {} ){
        if( faction.data ) faction = faction.data; //format data

        return faction.units.filter( unit => this.unitInPlay( unit, options ) );
    },


    /**
     * Is the given unit in our reserves and not killed?
     *
     * @param unit
     * @param options
     * @returns {boolean}
     */
    unitInReserves( unit, options = {} ){
        options.inReserves = true;
        options.notKilled = true;
        return this.isValidUnit( unit, options );
    },


    /**
     * Is the given unit in play and not killed?
     *
     * @param unit
     * @param options
     * @returns {boolean}
     */
    unitInPlay( unit, options = {} ){
        options.onBoard = true;
        options.notKilled = true;
        return this.isValidUnit( unit, options );
    },

    unitInGraveyard( unit, options = {} ){
        options.onBoard = true;
        options.killed = true;
        return this.isValidUnit( unit, options );
    },

    isChampion( unit ){
        return unit.type === "champion" || unit.isChampion;
    },

    /**
     * Returns the units the given faction has in the given area
     *
     * @param faction
     * @param area
     * @param options
     * @returns {Unit[]}
     */
    factionUnitsInArea( faction, area, options = {} ){
        // format inputs
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;

        // apply unit filters
        return faction.units.filter( unit => this.unitInArea( unit, area, options ) );
    },


    /**
     * Does the given faction have units in the given area?
     *
     * @param faction
     * @param area
     * @param options
     * @returns {boolean}
     */
    factionHasUnitsInArea( faction, area, options = {} ){
        // format inputs
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;

        return this.some( faction.units, unit => this.unitInArea( unit, area, options ) );
    },


    /**
     * Return an array of faction names of factions that have units in the given area
     *
     * @param {object} factions
     * @param area
     * @param options
     * @returns {string[]}
     */
    factionsWithUnitsInArea( factions, area, options = {} ){
        if( typeof area !== 'string' ) area = area.name;
        let factionsWithUnits = [];

        Object.values( factions ).forEach( faction => {
            // if our exclude option equals or include this faction name, skip this faction
            if( options.exclude === faction.name
                || ( Array.isArray( options.exclude ) && options.exclude.includes( faction.name ) ) ) return;

            if( this.factionHasUnitsInArea( faction, area, options ) ) factionsWithUnits.push( faction.name );
        });

        return factionsWithUnits;
    },


    /**
     * Is the given unit dead and in the given area
     *
     * @param unit
     * @param area
     * @param options
     * @returns {boolean}
     */
    deadInArea( unit, area, options = {} ){
        if( typeof area !== 'string' ) area = area.name; // format input

        options.killed = true;
        options.location = area;
        return this.isValidUnit( unit, options );
    },

    /**
     * Get all the dead from a faction
     *
     * @param faction
     * @param options
     * @returns {*}
     */
    factionDead( faction, options = {} ){
        options.killed = true;
        if( faction.data ) faction = faction.data; //format inputs
        return faction.units.filter( unit => this.isValidUnit( unit, options ) );
    },

    factionDeadInArea( faction, area, options = {} ){
        // format inputs
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;

        // apply unit filters
        return faction.units.filter( unit => this.deadInArea( unit, area, options ) );
    },

    /**
     * Get all the dead from a faction
     *
     * @param faction
     * @param options
     * @returns {*}
     */
    factionReserves( faction, options = {} ){
        options.inReserves = true;
        if( faction.data ) faction = faction.data; //format inputs
        return faction.units.filter( unit => this.isValidUnit( unit, options ) );
    },

    /**
     * Is the given unit alive in the given area
     *
     * @param unit
     * @param area
     * @param options
     * @returns {boolean}
     */
    unitInArea( unit, area, options = {} ){
        if( typeof area !== 'string' ) area = area.name;

        options.location = area;
        options.notKilled = true;
        return this.isValidUnit( unit, options );
    },


    /**
     * Returns the enemy units for a given faction in a given area
     *
     * @param faction
     * @param area
     * @param factions
     * @param options
     */
    enemyUnitsInArea( faction, area, factions, options = {} ){
        if( faction.data ) faction = faction.data;
        let results = {};

        Object.values( factions ).forEach( enemy => {
            if( enemy.name === faction.name ) return;

            // grab this factions units in the given area, and if they have any ass to our results object
            let units = this.factionUnitsInArea( enemy, area, options );
            if( units.length ) results[enemy.name] = units;
        });

        return results;
    },

    allUnitsInArea( area, factions, options = {} ){
        let results = {};

        Object.values( factions ).forEach( faction => {
            // grab this factions units in the given area, and if they have any ass to our results object
            let units = this.factionUnitsInArea( faction, area, options );
            if( units.length ) results[faction.name] = units;
        });

        return results;
    },


    enemyAreasWhereFactionHasUnits( faction, factions, areas, predictions = false ){
        if( faction.data ) faction = faction.data;

        let enemyAreas = this.determineEnemyAreas( faction, factions, areas, predictions );
        let enemyAreasWithUnits = [];

        for( let area of Object.values( areas ) ) {
            if ( !enemyAreas.includes( area.name ) || !this.factionHasUnitsInArea( faction, area ) ) continue;
            enemyAreasWithUnits.push(area.name);
        }

        return enemyAreasWithUnits;
    },

    /**
     * Return the number of enemy units in areas you own, or are predicted to own
     *
     * @param faction
     * @param factions
     * @param areas
     * @param predictions
     * @returns {number}
     */
    factionEnemyInAreasCount( faction, factions, areas, predictions = false ){
        let count = 0;
        let winningAreas = this.determineWinningAreas( faction, factions, areas, predictions );

        Object.values( factions ).forEach( enemy => {
            if( enemy.name === faction.name ) return;
            count += enemy.units.filter( unit => winningAreas.includes( unit.location ) && !unit.killed ).length;
        });

        return count;
    },


    /**
     * Returns an array of area names for the areas you are either currently winning (if a prediction
     * object is supplied) or you own (if no predictions object is supplied)
     *
     * @param faction
     * @param factions
     * @param areas
     * @param predictions
     * @returns {string[]}
     */
    determineWinningAreas( faction, factions, areas, predictions = false ){
        // if we are using a predictions object to determine the predicted owner of each area
        // use them to build our results
        if( predictions ) return this.factionWinningAreas( faction, factions, areas, predictions );

        // otherwise just look at the current owners
        let results = [];
        Object.values( areas ).forEach( area => {
            if( area.data ) area = area.data; // format input
            if( area.owner === faction.name ) results.push( area.name );
        });

        return results;
    },


    /**
     * Return the unit types the given faction controls in enemy areas
     *
     * @param faction
     * @param factions
     * @param areas
     * @param predictions
     */
    unitTypesInEnemy( faction, factions, areas, predictions = false ){
        let enemyAreas = this.determineEnemyAreas( faction, factions, areas, predictions );
        let typesInEnemy = {};

        faction.units.forEach( unit => {
            // if this unit isn't in an enemy area, or is killed abort
            if( !enemyAreas.includes( unit.location ) || unit.killed ) return;

            // otherwise add it to our our type tally
            typesInEnemy[unit.type] = typesInEnemy[unit.type] + 1 || 1;
        });

        return typesInEnemy;
    },

};



module.exports = helpers;
