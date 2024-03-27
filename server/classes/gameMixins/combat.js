let Battle = require( '../Battle' );

let obj = {

    /**
     * Resolve battle
     *
     * @param area
     * @param options
     */
    async battle( area, options = {} ){

        // if we can't battle in this area, abort
        if( !area.canBattle() ){
            this.message({ message : `Unable to battle in the ${area.name}` , class : 'warning' });
            return;
        }

        // initialize a new battle
        this.combat = new Battle( area, this, options );
        this.data.combat = this.combat.data;
        this.message({ message : `A battle begins in the ${area.name}`, class : 'highlight' });

        // resolve the battle
        try {
            await this.combat.init();
        } catch( error ){
            console.error( error );
        }

        // once the battle is over log it to all players then wait three seconds before closing up shop
        // to give player a chance to see te final results
        this.message({ message :  `The battle in the ${area.name} concludes`, class : 'highlight' });
        await this.pushGameDataToPlayers();
        await this.wait( 3 );
        this.combat = null;
        this.data.combat = null;
    },


    /**
     * Assign hits to a unit
     *
     * @param unit
     * @param faction
     * @param count
     * @param options
     */
    async assignHitsToUnit( unit, faction, count = 1, options = {} ){
        let owner = this.factions[unit.faction];

        // hidden units are immune
        if( unit.hidden ){
            return 'hidden unit ignores hit';
        }

        if( unit.type === 'smoke' ){
            this.popup( owner.playerId, { type: 'smoke', area : unit.location, faction : owner.name });
            owner.data.smokeAreas = owner.data.smokeAreas?.filter( area => area !== unit.location )
            return 'a hit was lost in the smoke';
        }

        // if this unit has an onDamaged trigger, resolve it
        if( unit.onDamaged ){
            let onDamagedResults = await owner[unit.onDamaged]({
                unit : unit,
                hits : count,
                attacker : faction
            });

            if( onDamagedResults ) return onDamagedResults;
        }

        // if this unit has toughness, isn't wounded, and we are only assigning it one hit then it becomes wounded
        if( count === 1 && unit.toughness && !unit.flipped ){
            unit.flipped = true;

            if( unit.onWounded ) {
                await owner[unit.onWounded](unit);
            }

            return 'wounds';
        }

        // otherwise kill the unit
        try {
            await this.killUnit( unit, faction, options );
        } catch( error ){
            console.error( error );
        }

        return 'kills';
    },


    /**
     * Kill the given unit
     *
     * @param unit
     * @param faction
     * @param options
     */
    async killUnit( unit, faction, options = {} ){
        if( typeof faction === 'string' ) faction = this.factions[faction];
        let victimFaction = this.factions[unit.faction];

        // un-web our unit if needed
        if( unit.webbed ) delete unit.webbed;

        // mark the unit as killed
        unit.killed = faction.name;

        // unready killed units
        if( unit.ready ) unit.ready = false;

        // check for any triggered events on the victim unit that triggers when it is killed
        let triggerResults = await faction.unitTriggeredEvents( 'unitKilled', [{ unit : unit }] );

        // check for triggered events that trigger when a unit is killed
        if( triggerResults !== "NO_FURTHER_TRIGGERS" ){
            // if we have some triggered effect on combat death
            if( options.onCombatDeath ) await options.onCombatDeath.faction[options.onCombatDeath.method]( unit );

            // check for triggered events belonging to a faction whenever they kill a unit
            if( faction.triggers.onFactionKillsUnit ) await faction[faction.triggers.onFactionKillsUnit]( unit, options );

            // check for triggered events whenever one of your units are killed
            if( victimFaction.triggers.onFactionUnitKilled ) await victimFaction[victimFaction.triggers.onFactionUnitKilled]( unit, faction, options );
        }

        // unflip our unit if needed
        if( unit.flipped && !unit.dontUnflipAutomatically) this.factions[unit.faction].unflipUnit( unit );

    },
};

module.exports = obj;
