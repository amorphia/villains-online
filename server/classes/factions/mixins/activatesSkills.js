let obj = {

    /**
     * Activate an area's skill ability
     *
     * @param area
     * @param options
     */
    async useSkill( area, options = {} ) {
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
        this.game().popup( this.playerId, { type: 'skill', area : area.name, faction : this.name });

        // use our skilled units to activate this ability
        let exhaustedUnits = await this.useSkilledUnitsToActivateSkill( area, options );

        // handle any pre-skill triggers (that may modify our skill)
        let skillModification = {};

        if( this.triggers.onBeforeSkill ){
            skillModification = await this[this.triggers.onBeforeSkill]( area, exhaustedUnits );
        }

        try {
            // activate this area's skill
            if( !skillModification?.dontResolveSkill ){
                await area.skill( this );
            }


            // if we have the doubleResolve skill modification, resolve that skill a second time
            if( skillModification?.doubleResolve ) await area.skill( this );

            // handle any post skill activation triggers
            await this.handlePostSkillTriggers( area, exhaustedUnits );

        } catch ( error ) {
            console.error( error );
        }


        return exhaustedUnits;

    },


    /**
     * Exhaust our readied units in this area to activate this skill,
     * and return an array of units exhausted this way
     *
     * @param area
     * @param options
     * @returns {Unit[]}
     */
    async useSkilledUnitsToActivateSkill( area, options ){
        let units = [];

        if( options.noExhaust ) return units;

        let readiedUnits = [];

        this.data.units.forEach( unit => {
            if( _.unitReadyInArea( unit, area ) ){
                readiedUnits.push(unit);
            }
        });

        if(readiedUnits.length > 1 && this.data.exhaustSingleUnit){

            // allow the player to select one unit to exhaust
            let response = await this.prompt( 'choose-units', {
                count : 1,
                areas : [area.name],
                readyOnly: true,
                playerOnly : true,
                message: "Choose a unit to exhaust"
            });

            readiedUnits = [this.game().objectMap[ response.units[0] ]];
        }

        readiedUnits.forEach( unit => {
            units.push({ unit : unit });
            unit.ready = false;
        });

        return units;
    },





    /**
     * Handle any post skill factions for our exhausted units, or our faction
     *
     * @param area
     * @param exhaustedUnits
     */
    async handlePostSkillTriggers( area, exhaustedUnits ){
        // handle any of our exhausted unit's "onSkill" triggered events
        await this.unitTriggeredEvents( 'skill', exhaustedUnits, area );

        // handle any faction "onAfterSkill" triggered events
        if( this.triggers.onAfterSkill ) await this[this.triggers.onAfterSkill]( area, exhaustedUnits );
    },


    /**
     * Ready our skilled units, and exhaust any units that are ready, but no longer have the skilled ability
     */
    readySkilledUnits() {
        if( this.data.skilledPatsies ) this.message(`patsies have become readied` );

        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit, { skilled : true } ) ) unit.ready = true;
            if( unit.ready && ( !unit.skilled || !unit.location || unit.killed ) ) unit.ready = false;
        });
    }

};

module.exports = obj;

