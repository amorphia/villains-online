let helpers = {

    /**
     * Has the given faction used the given area's skill?
     *
     * @param faction
     * @param area
     * @returns {boolean}
     */
    hasUsedSkill( faction, area ){
        // format inputs
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;

        return faction.usedSkills.includes( area );
    },


    /**
     * Can the given faction use the magick ability in the given area?
     *
     * @param faction
     * @param area
     * @param factions
     * @returns {boolean}
     */
    canUseMagick( faction, area, factions ){
        // format inputs
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        // if we aren't witches then heck no
        if( faction.name !== 'witches') return false;

        // do we have any flipped units in this area?
        return faction.units.some( unit => this.unitInArea( unit, area, { flipped : true } ) );
    },


    /**
     * Can the given faction activate the skill ability of the given area?
     *
     * @param faction
     * @param area
     * @param factions
     * @returns {boolean}
     */
    canUseSkill( faction, area, factions ){
        // format data
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        // if we've already used this skill then hard no
        if( this.hasUsedSkill( faction, area ) ) return false;

        // check if we have at least one ready unit here
        return faction.units.some( unit => this.unitReadyInArea( unit, area ) );
    },


    /**
     * Is the given unit ready and in play?
     *
     * @param unit
     * @param options
     * @returns {boolean}
     */
    unitReady( unit, options = {} ){
        options.notKilled = true;
        options.ready = true;
        options.onBoard = true;
        return this.isValidUnit( unit, options );
    },


    /**
     * Is the given unit ready and in the given area?
     *
     * @param unit
     * @param area
     * @param options
     * @returns {boolean}
     */
    unitReadyInArea( unit, area, options = {} ){
        if( typeof area !== 'string' ) area = area.name; // format input

        options.notKilled = true;
        options.ready = true;
        options.location = area;
        return this.isValidUnit( unit, options );
    },


    /**
     * Is the given unit ready and in the given area?
     *
     * @param unit
     * @param area
     * @param options
     * @returns {boolean}
     */
    unitNotReadyInArea( unit, area, options = {} ){
        if( typeof area !== 'string' ) area = area.name; // format inputs

        options.notKilled = true;
        options.notReady = true;
        options.location = area;
        return this.isValidUnit( unit, options );
    },


};



module.exports = helpers;