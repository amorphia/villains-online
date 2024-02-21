class Battle {
    gameId; // {string}
    area; // {Area}
    options; // {object}

    data = {
        title : 'Resolving pre-combat effects', // {string} text to display in the combat UI title bar
        factionIndex : 0, // {number} the index of the faction currently resolving their attacks
        attackBonus : 0, // {number} global attack bonus applied to all units in this battle
        areaName : null, // {string} the name of the area this battle is taking place in
        currentUnit : null, // {Unit} the unit currently resolving its attacks
        factions : [], // {array} the factions participating in this combat
        lastAttack : null, // the results of the last attack made, used to display in the UI
        completed : false, // has this battle completed
        preCombatEffects : true, // are we in the pre-combat effect step?
        isFirstStrikePhase : false, // are we in the first strike phase?
        completedAttacks : {} // how many attacks have been made by each faction
    };


    constructor( area, game, options = {} ) {
        this.area = area;
        this.data.areaName = area.name;
        this.gameId = game.id;
        this.options = options;
        if( this.options.attackBonus ) this.data.attackBonus = this.options.attackBonus;
    }


    /**
     *
     *
     *  CORE METHODS
     *
     *
     */

    /**
     * Initialize a Battle
     */
    async init(){
        // if we can't battle in this area, abort
        if( !this.area.canBattle() ) return this.game().message({
            message : `Unable to battle in the ${this.area.name}`,
            class : 'warning'
        });

        this.game().sound( 'combat' );
        await this.resolveBattle();
    }


    /**
     * Resolve this battle
     */
    async resolveBattle(){
        // prebattle triggers
        await this.resolveBattleTriggers( 'onBeforeBattle' );

        // first strike phase
        if( this.hasFirstStrikeUnits() ){
            this.data.isFirstStrikePhase = true;
            await this.resolveStrikePhase();
            this.data.isFirstStrikePhase = false;
        }

        // regular strike phase
        if( this.area.canBattle() ) await this.resolveStrikePhase();

        // after battle triggers
        await this.resolveBattleTriggers( 'onAfterBattle' );

        //
        this.cleanupAfterBattle();

        // finish up
        this.data.title = 'Battle completed';
        this.data.completed = true;
    }

    cleanupAfterBattle(){
        // I'm sure there is a better way to this, but this was easy
        // cycle through every unit in the game and delete any "combatTempProps"
        Object.values(this.game().factions).forEach(faction => {
            faction.data.units.forEach(unit => delete unit.combatTempProp);
        });
    }

    /**
     * resolve battle triggers
     */
    async resolveBattleTriggers( triggerType ){

        // check for unit based modifications
        let units = this.area.units();
        for( let unit of units ){
            let method = unit[triggerType];
            if( method ) await this.game().factions[unit.faction][method]( this );
        }

        // check for faction based modifications
        for( let faction of Object.values( this.game().factions ) ){
            let method = faction.triggers[triggerType];
            if( method ) await faction[method]( this );
        }

        if( triggerType === 'onBeforeBattle' ) this.data.preCombatEffects = false;
    }


    /**
     * Resolve a strike phase
     */
    async resolveStrikePhase(){
        this.data.factionIndex = 0;
        this.data.currentUnit = null;
        this.data.factions = [];
        this.data.title = this.data.isFirstStrikePhase ? 'Resolving First Strike Attacks' : 'Resolving Attacks';

        // build the list of factions with units in this area and whether they can attack this phase
        this.makeFactionsList();

        // for each of these factions resolve this strike phase
        for( let i = 0; i < this.data.factions.length; i++ ){
            let faction = this.data.factions[i];
            this.data.factionIndex = i;
            await this.resolveFactionStrikePhase( faction );
        }

        // shift the faction index ahead by one to make sure no-one
        // is currently selected once we are done
        this.data.factionIndex++;
    }


    /**
     * Generate our faction list
     */
    makeFactionsList(){
        // make a list of all the units that will be attacking this battle, by faction
        _.forEach( this.game().factions, faction => this.setFactionAttackingUnits( faction ) );

        // sort the attacking factions by the game's current player order
        let playerOrder = this.game().data.playerOrder;
        this.data.factions.sort( (a,b) => {
            return playerOrder.indexOf( a.playerId ) - playerOrder.indexOf( b.playerId );
        });

        // then check with each faction to see if they have an ability that places them
        // somewhere else in the battle's player order (like say, the ninjas going first)
        Object.values( this.game().factions ).forEach( faction => {
            if( faction.battleOrderSort ) faction.battleOrderSort( this.data.factions );
        });
    }


    /**
     * Set which units from this faction can attack
     *
     * @param faction
     */
    setFactionAttackingUnits( faction ){
        this.data.completedAttacks[faction.name] = this.data.completedAttacks[faction.name] ?? 0;

        // get our units in this area
        let unitsInArea = _.factionUnitsInArea( faction, this.area.name );
        if( !unitsInArea.length ) return;

        // for each unit, mark if it must attack during this phase
        unitsInArea.forEach( unit => {
            if( this.canAttackThisPhase( unit ) ){
                unit.needsToAttack = true;
                if( unit.prepared ) unit.startedPrepared = true;
            }
        });

        // add this faction to our list of factions participating in this battle
        this.data.factions.push({
            name: faction.name,
            playerId : faction.playerId,
            units: unitsInArea,
            mods: faction.combatModifiersList( this.area ),
            order : faction.playerOrder()
        });
    }


    /**
     * Resolve a strike phase for a given faction
     *
     * @param faction
     */
    async resolveFactionStrikePhase( faction ){
        this.game().message({
            faction : faction.name,
            message : `start their ${ this.data.isFirstStrikePhase ? 'first strike ' : '' }attacks`
        });

        try {
            await this.makeAttacks( faction );
        } catch( error ){
            console.error( error );
        }

        this.game().message({
            faction : faction.name,
            message : `have completed their ${ this.data.isFirstStrikePhase ? 'first strike ' : '' }attacks`
        });
    }


    /**
     * Resolve the given faction's attacks for this strike phase
     *
     * @param faction
     */
    async makeAttacks( faction ){
        // while we still have units to attack with, resolve the next attack
        while( this.hasUnitsToAttack( faction ) ){
            await this.resolveNextAttack( faction );
        }

        // clear any units that still need to attack
        this.clearFactionNeedsToAttack( faction );
    }


    /**
     * mark all remaining units as no longer needing to attack. Needed for cases where the
     * opponents are wiped out before all of your units have had a chance to attack
     *
     * @param faction
     */
    clearFactionNeedsToAttack( faction ){
        faction.units.forEach( unit => {
            if( unit.needsToAttack ) unit.needsToAttack = false;
            if( unit.startedPrepared ) delete unit.startedPrepared;
        });
    }


    /**
     * resolve the next attack by a faction this strike phase
     *
     * @param faction
     */
    async resolveNextAttack( faction ){
        let player, data;
        let gameFaction = this.game().factions[faction.name];

        let controllingFaction = this.doesAnotherFactionControlAttack( gameFaction ) ?? gameFaction;

        // lets get our next attacker
        let unit = await this.chooseNextAttacker( gameFaction, controllingFaction );
        if( !unit ) return;

        // resolve attack with that unit
        let area = this.game().areas[ unit.location ];

        let attackArgs = {
            area : area,
            attacks : unit.attack,
            unit : unit,
            attackBonus : this.data.attackBonus,
            inCombat : true,
            controllingFaction : controllingFaction,
            onCombatDeath : this.options.onCombatDeath,
        };

        // attack with the unit
        await gameFaction.attack( attackArgs ).catch( error => console.error( error ) );
        this.data.completedAttacks[faction.name]++;
        unit.needsToAttack = false;
        if(unit.startedPrepared) delete unit.startedPrepared;
        this.data.currentUnit = null;
    }


    doesAnotherFactionControlAttack( gameFaction ){
        return Object.values( this.game().factions ).find( faction => {
            return faction.name !== gameFaction.name
                    && typeof faction.controlsCombat === 'function'
                    && faction.controlsCombat( gameFaction, this );
        });
    }

    /**
     * Allow a player to choose their next attacking unit
     *
     * @param gameFaction
     * @param controllingFaction
     * @returns {Promise<*>}
     */
    async chooseNextAttacker( gameFaction, controllingFaction ){
        let player, data, unit;

        // let player choose their next unit
        [player, data] = await this.game().promise({
            players: controllingFaction.playerId,
            name: 'choose-units',
            data : {
                count : 1,
                areas : [this.area.name],
                needsToAttack: true,
                belongsTo : gameFaction.name,
                canDecline : controllingFaction.data.optionalAttack,
                message: "Choose a unit to make an attack",
            }
        }).catch( error => console.error( error ) );

        // if we can decline attacking then clear out our unit's "need to attack" flags and exit
        if( data.decline ){
            this.clearFactionNeedsToAttack( gameFaction.data );
            return;
        }

        // no unit selected? Welp, guess we are done here
        if( !data.units ) return;

        // set our unit data and return
        unit = this.game().objectMap[ data.units[0] ];
        this.data.currentUnit = unit.id;
        return unit;
    }


    /**
     * Manually removes a unit from combat. if something unusual happens to a unit mid battle
     * (such as it's replaced with an enemy unit) then we need to remove it from the combat entirely
     *
     * @param unit
     */
    removeUnitFromCombat( unit ){
        if( unit.needsToAttack ) unit.needsToAttack = false;
        if( unit.startedPrepared ) delete unit.startedPrepared;
        for( let faction of Object.values( this.data.factions ) ){
            if( faction.name !== unit.faction ) continue;
            faction.units = faction.units.filter( item => item.id !== unit.id );
        }
    }

    addUnitToCombat( unit ){
        if(unit.location !== this.area.name ) return;

        if( unit.attack.length ) unit.needsToAttack = true;
        if( unit.prepared ) unit.startedPrepared = true;
        for( let faction of Object.values( this.data.factions ) ){
            if( faction.name !== unit.faction || faction.units.find( item => item.id === unit.id )) continue;
            faction.units.push( unit );
        }
    }

    /**
     *
     *
     *   VALUE METHODS
     *
     *
     */


    /**
     * Returns this battle Game instance
     *
     * @returns {Game}
     */
    game(){
        return Server.games[this.gameId];
    }


    /**
     * Does this faction have units that can currently attack?
     *
     * @param faction
     * @param basic
     * @returns {boolean}
     */
    hasUnitsToAttack( faction, basic ){
        // do we have a unit with an attack that hasn't attacked yet?
        let hasAttackingUnit = _.find( faction.units, unit => unit.needsToAttack );

        // is there anyone to shoot at?
        let hasTarget = this.game().factions[faction.name].hasEnemyUnitsInArea( this.area, { basic : basic, notHidden : true } );

        return hasAttackingUnit && hasTarget;
    }


    /**
     * Are there any first strike units present in this area?
     *
     * @returns {boolean}
     */
    hasFirstStrikeUnits(){
        return this.area.units().filter( unit => unit.firstStrike ).length > 0;
    }


    /**
     * Checks to see if a given unit can attack this phase
     *
     * @param unit
     * @returns {boolean}
     */
    canAttackThisPhase( unit ){
        // does this unit have an attack value, and does this unit's attack speed match the current strike phase
        // ie. if its currently the first strike phase and the unit has first strike, or the reverse
        return !unit.webbed && unit.attack.length && !! this.data.isFirstStrikePhase === !! unit.firstStrike;
    }

}

module.exports = Battle;
