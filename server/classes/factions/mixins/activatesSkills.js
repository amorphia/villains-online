let obj = {

    /**
     * Activate an area's skill ability
     *
     * @param area
     */
    async useSkill( area ) {
        // grab our area instance, if needed
        if( typeof area === 'string' ) area = this.game().areas[area];

        // if we have already used this skill this turn, abort
        if( _.hasUsedSkill( this, area ) ){
            this.message( `has already used the ${area.name}'s skill ability` );
            return;
        }

        // add this area to our array of used skills
        this.data.usedSkills.push( area.name );

        // display our activation
        this.message( `activate the skill ability of the ${area.name}` );
        this.game().popup( this.playerId, { skill : true, area : area.name, faction : this.name });

        // handle any pre-skill triggers (that may modify our skill)
        let skillModification = this.handlePreSkillTriggers( area );

        // use our skilled units to activate this ability
        let exhaustedUnits = this.useSkilledUnitsToActivateSkill( area );

        try {
            // activate this area's skill
            await area.skill( this );

            // if we have the doubleResolve skill modification, resolve that skill a second time
            if( skillModification?.doubleResolve ) await area.skill( this );

            // handle any post skill activation triggers
            await this.handlePostSkillTriggers( area, exhaustedUnits );
        } catch ( error ) {
            console.error( error );
        }

    },


    /**
     * Exhaust our readied units in this area to activate this skill,
     * and return an array of units exhausted this way
     *
     * @param area
     * @returns {Unit[]}
     */
    useSkilledUnitsToActivateSkill( area ){
        let units = [];

        this.data.units.forEach( unit => {
            if( _.unitReadyInArea( unit, area ) ){
                units.push({ unit : unit });
                unit.ready = false;
            }
        });

        return units;
    },


    /**
     * Handle any pre-skill triggers and return any skill effect modifications from them
     *
     * @param area
     */
    async handlePreSkillTriggers( area ){
        if( this.triggers.onBeforeSkill ){
            return await this[this.triggers.onBeforeSkill]( area );
        }
    },


    /**
     * Handle any post skill factions for our exhausted units, or our faction
     *
     * @param area
     * @param exhaustedUnits
     */
    async handlePostSkillTriggers( area, exhaustedUnits ){
        // handle any of our exhausted unit's "onSkill" triggered events
        await this.unitTriggeredEvents( 'skill', exhaustedUnits );

        // handle any faction "onAfterSkill" triggered events
        if( this.triggers.onAfterSkill ) await this[this.triggers.onAfterSkill]( area, exhaustedUnits );
    },


    /**
     * Ready our skilled units, and exhaust any units that are ready, but no longer have the skilled ability
     */
    readySkilledUnits() {
        if( this.data.skilledPatsies ) this.message(`patsies have become readied` );

        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit ) && unit.skilled ) unit.ready = true;
            if( !unit.skilled && unit.ready ) unit.ready = false;
        });
    }

};

module.exports = obj;

