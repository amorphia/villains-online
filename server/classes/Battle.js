class Battle {
    gameId;
    area;
    options;

    data = {
        title : 'Resolving pre-combat effects',
        factionIndex : 0,
        attackBonus : null,
        areaName : null,
        currentUnit : null,
        factions : [],
        attacks : {},
        lastAttack : null,
        completed : false,
        preCombatEffects : true,
        isFirstStrikePhase : false,
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

    async init(){
        // if we can't battle in this area, abort
        if( !this.area.canBattle() ) return this.game().message({
            message : `Unable to battle in the ${this.area.name}`,
            class : 'warning'
        });

        this.game().sound( 'combat' );
        await this.resolveBattle();
    }


    async resolveBattle(){
        // prebattle triggers
        await this.resolveBeforeBattleTriggers();

        // first strike phase
        if( this.hasFirstStrikeUnits() ){
            this.data.isFirstStrikePhase = true;
            await this.resolveStrikePhase();
            this.data.isFirstStrikePhase = false;
        }

        // regular strike phase
        if( this.area.canBattle() ) await this.resolveStrikePhase();

        // after battle triggers
        await this.resolveAfterBattleTriggers();

        // finish up
        this.data.title = 'Battle completed';
        this.data.completed = true;
    }


    async resolveBeforeBattleTriggers(){
        for( let faction of Object.values( this.game().factions ) ){
            await faction.onBeforeBattle( this );
        }
        this.data.preCombatEffects = false;
    }


    async resolveAfterBattleTriggers(){
        for( let faction of Object.values( this.game().factions ) ){
            await faction.onAfterBattle( this );
        }
    }


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
            faction.battleOrderSort( this.data.factions );
        });
    }


    setFactionAttackingUnits( faction ){
        // get our units in this area
        let unitsInArea = _.factionUnitsInArea( faction, this.area.name );
        if( !unitsInArea.length ) return;

        // for each unit, mark if it must attack during this phase
        unitsInArea.forEach( unit => {
            if( this.canAttackThisPhase( unit ) ) unit.needsToAttack = true;
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


    async makeAttacks( factionData ){
        // while we still have units to attack with, resolve the next attack
        while( this.hasUnitsToAttack( factionData ) ){
            await this.resolveNextAttack( factionData );
        }

        // clear any units that still need to attack
        this.clearFactionNeedsToAttack( factionData );
    }


    // mark all remaining units as no longer needing to attack. Needed for cases where the
    // opponents are wiped out before all of your units have had a chance to attack
    clearFactionNeedsToAttack( factionData ){
        factionData.units.forEach( unit => {
            if( unit.needsToAttack ) unit.needsToAttack = false
        });
    }

    async resolveNextAttack( factionData ){
        let player, data;
        let gameFaction = this.game().factions[factionData.name];

        // does this faction qualify for the ninja seeking/hidden ability?
        let ninjaAttack = this.isNinjaAttack( gameFaction );

        // lets get our next attacker
        let unit = await this.chooseNextAttacker( gameFaction, ninjaAttack );
        if( !unit ) return;

        // resolve attack with that unit
        let area = this.game().areas[ unit.location ];

        let attackArgs = {
            area : area,
            attacks : unit.attack,
            unit : unit,
            attackBonus : this.options.attackBonus,
            inCombat : true,
        };

        // if ninjas haven't attacked yet then this attack gains seeking
        if( ninjaAttack ) attackArgs.seeking = true;

        // attack with the unit
        await gameFaction.attack( attackArgs ).catch( error => console.error( error ) );
        unit.needsToAttack = false;
        this.data.currentUnit = null;

        // mark that ninjas have attacked and used up their seeking/hidden attack
        if( ninjaAttack ) gameFaction.data.firstAttackThisBattle = false;
    }


    async chooseNextAttacker( gameFaction, ninjaAttack ){
        let player, data, unit;

        // let player choose their next unit
        [player, data] = await this.game().promise({
            players: gameFaction.playerId,
            name: 'choose-units',
            data : {
                count : 1,
                areas : [this.area.name],
                needsToAttack: true,
                playerOnly : true,
                canDecline : gameFaction.data.optionalAttack,
                message: "Choose a unit to make an attack",
                gainsSeeking : ninjaAttack,
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


    removeUnitFromCombat( unit ){
        // if something unusual happens to a unit mid battle (such as it's replaced with an
        // enemy unit) then we need to remove it from the combat entirely
        if( unit.needsToAttack ) unit.needsToAttack = false;
        for( let faction of this.data.factions ){
            if( faction.name !== unit.faction ) continue;
            faction.units = faction.units.filter( item => item.id !== unit.id );
        }
    }


    /**
     *
     *
     *   VALUE METHODS
     *
     *
     */

    game(){
        return Server.games[this.gameId];
    }


    hasUnitsToAttack( faction, basic ){
        // do we have a unit with an attack that hasn't attacked yet?
        let hasAttackingUnit = _.find( faction.units, unit => unit.needsToAttack );

        // is there anyone to shoot at?
        let hasTarget = this.game().factions[faction.name].hasEnemyUnitsInArea( this.area, { basic : basic, notHidden : true } );

        return hasAttackingUnit && hasTarget;
    }


    isNinjaAttack( gameFaction ){
        // are we the ninjas and this is our first attack this battle?
        return gameFaction.name === 'ninjas' && gameFaction.data.firstAttackThisBattle;
    }


    hasFirstStrikeUnits(){
        return this.area.units().filter( unit => unit.firstStrike ).length > 0;
    }


    canAttackThisPhase( unit ){
        // does this unit have an attack value, and does this unit's attack speed match the current strike phase
        // ie. if its currently the first strike phase and the unit has first strike, or the reverse
        return unit.attack.length &&  !! this.data.isFirstStrikePhase === !! unit.firstStrike;
    }

}

module.exports = Battle;
