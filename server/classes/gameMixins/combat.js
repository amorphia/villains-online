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
     */
    async assignHitsToUnit( unit, faction, count = 1 ){

        // hidden units are immune
        if( unit.hidden ){
            return 'hidden unit ignores hit'
        }

        // if this unit has an onDamaged trigger, resolve it
        if( unit.onDamaged ){
            let owner = this.factions[unit.faction];
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
            return 'wounds';
        }

        // otherwise kill the unit
        try {
            await this.killUnit( unit, faction );
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
     */
    async killUnit( unit, faction ){
        if( typeof faction === 'string' ) faction = this.factions[faction];

        // mark the unit as killed
        unit.killed = faction.name;

        // check for any triggered events on the victim unit that triggers when it is killed
        try {
            await faction.unitTriggeredEvents( 'unitKilled', [{ unit : unit }] );
        } catch( error ){
            console.error( error );
        }

        // check for triggered events belonging to a faction whenever they kill a unit
        if( faction.triggers.onFactionKillsUnit ) await faction[faction.triggers.onFactionKillsUnit]( unit );

        if( unit.flipped ){
            this.factions[unit.faction].unflipUnit( unit );
        }
    },
};

module.exports = obj;
