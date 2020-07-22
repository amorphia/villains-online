let mixin = {

    /**
     *
     * GAME
     *
     */

    game(){
        return Server.games[this.gameId];
    },


    getPlayer(){
        return this.game().players[this.playerId];
    },

    playerOrder(){
        return _.indexOf( this.game().data.playerOrder, this.playerId );
    },

    /**
     *
     *
     *  VICTORY
     *
     */

    hasVictory(){
        return this.data.ap >= this.game().data.maxAP || this.data.pp >= this.game().data.maxPP;
    },

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

    areas() {
        let areas = [];
        _.forEach( this.game().areas, ( area, name ) => {
            if( area.data.owner === this.name ){
                areas.push( name );
            }
        });
        return areas;
    },


    controlsArea( area ){
        if( typeof area !== 'string' ) area = area.name;
        return this.areas().includes( area );
    },

    areasWithEnemyUnits( args = {} ){
        let areas = [];

        _.forEach( this.game().factions, faction => {
            areas = _.union( areas, faction.areasWithUnits() );
        });

        if( args.adjacent ){
            if( typeof args.adjacent === 'string' ) args.adjacent = this.game().areas[ args.adjacent];
            areas = _.intersection( areas, args.adjacent.data.adjacent );
        }

        return areas;
    },

    areasWithAttackingUnits(){
        let areas = {};

        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit ) && unit.attack.length ){
                areas[ unit.location ] = true;
            }
        });

        areas = Object.keys( areas );
        areas = areas.filter( areaName => {
            let area = this.game().areas[ areaName ];
            if( !_.find( area.data.cards, card => card.class === 'cease-fire' )
                && _.factionsWithUnitsInArea( this.game().data.factions, areaName, { exclude : this.name } ).length
            ) return true;

        });

        return areas;
    },

    hasEnemyUnitsInArea( area, basicOnly ){
        let enemyUnits = this.enemyUnitsInArea( area, basicOnly );
        return Object.keys( enemyUnits ).length > 0;
    },

    enemyUnitTypesInArea( area, basicOnly ){
        let types = {};
        let enemyUnits = this.enemyUnitsInArea( area, basicOnly );

        Object.values( enemyUnits ).forEach( factionUnits => {
            factionUnits.forEach( unit =>  {
                types[unit.type] = true;
            });
        });

        return Object.keys( types );
    },

    enemyUnitsInArea( area, basicOnly ){
        return _.enemyUnitsInArea( this.data, area.name, this.game().data.factions, basicOnly );
    },

    areasWithUnits( options = {} ){
        if( typeof options.types === 'string' ) options.types = [ option.types ];

        let areas = {};
        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit )
                && ( !options.types || options.types.includes( unit.type ) )
                && ( !options.flipped || unit.flipped )
            ){
                areas[ unit.location ] = true;
            }
        });

        let areasArray = Object.keys( areas );

        if( options.excludesArea ){
            areasArray = areasArray.filter( area => area !== options.excludesArea );
        }

        return areasArray;
    },

    hasUnitsInArea( area ) {
        return _.hasUnitsInArea( this.data, area );
    },

    unitsInArea( area, type ) {
        return _.factionUnitsInArea( this, area, type );
    },

    influenceInArea( area ){
        return _.influence( this, area, this.game().data.factions );
    },

    targetArea(){
        let areaName = this.data.cards.target[0].target;
        return this.game().areas[areaName];
    },

    targetName(){
       return this.data.cards.target[0].target;
    },

    hasExterminatedArea( area ){
        if( typeof area === 'string' ) area = this.game().data.areas[area];
        return _.areaExterminated( area, this.game().data.factions ) === this.name;
    },



    totalKills(){
        let kills = 0;

        _.forEach( this.game().factions, ( faction, name ) => {
            if( name === this.name ) return;
            kills += faction.data.units.filter( unit => unit.killed === this.name ).length;
        });

        return kills;
    },


    hasBiohazardInArea( area ){
        if( this.name !== 'mutants' ) return false;
        let bio = this.data.tokens.find( token => token.name === 'biohazard' );
        return bio && bio.revealed && bio.location === area.name;
    },


    /**
     *
     *
     *  Skills
     *
     */

    hasUsedSkill( area ){
        return _.hasUsedSkill( this, area );
    },

    canUseSkill( area ){
        return _.canUseSkill( this, area );
    },

    /**
     *
     * UNITS
     *
     */

    unitsInPlay() {
        return this.data.units.filter( unit => _.unitInPlay( unit ) );
    },

    unitTypesInPlay( basicOnly ){
        let types = {};
        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit ) && ( ! basicOnly || unit.basic ) ) types[unit.type] = true;
        });
        return Object.keys( types );
    },

    unitTypesInReserves( basicOnly ){
        let types = {};
        this.data.units.forEach( unit => {
           if( _.unitInReserves( unit ) && ( ! basicOnly || unit.basic ) ) types[unit.type] = true;
        });
        return Object.keys( types );
    },


    reserves(){
        return this.data.units.filter( unit => !unit.location );
    },


    dead(){
        return this.data.units.filter( unit => unit.killed );
    },

    areasWithKills(){
        let areas = {};

        this.kills().forEach( kill => {
            areas[kill.location] = true;
        });

        return Object.keys( areas );
    },

    kills(){
        let kills = [];

        _.forEach( this.game().data.factions, faction => {
            faction.units.forEach( unit => {
                if( unit.killed === this.name ){
                    kills.push( unit );
                }
            })
        });

        return kills;
    },


    killsIn( area ){
        area = typeof area === 'string' ? area : area.name;
        let kills = [];

        _.forEach( this.game().data.factions, faction => {
            faction.units.forEach( unit => {
                if( _.factionKilledUnitHere( this, unit, area ) ){
                    kills.push( unit );
                }
            })
        });

        return kills;
    },


    killedUnitHere( unit, area ){
        return _.factionKilledUnitHere( this, unit, area );
    },



    /**
     *
     * MONEY
     *
     */

    money(){
        return this.data.resources + this.data.energy;
    },


    resourcesToCollect(){
        let areas = this.areas();
        let resources = areas.length;
        if( areas.includes( 'bank' ) ) resources++;
        return resources;
    },

    areasExterminated(){
        let areas = [];
        _.forEach( this.game().areas, area => {
            if( _.areaExterminated( area, this.game().data.factions ) === this.name ) areas.push( area.name );
        });
        return areas;
    },



    /**
     *
     * COMBAT
     *
     */


    combatModifiersList( area ){
        let mods = [];

        // attack bonus
        if( this.data.attackBonus ) mods.push( { type : 'attackBonus', text : `Gains +${this.data.attackBonus} to attack rolls`, val : this.data.attackBonus });

        // defense bonus
        if( this.data.defenseBonus ) mods.push( { type : 'defenseBonus', text : `Enemies suffer -${this.data.defenseBonus} to their attack rolls`, val : this.data.defenseBonus });

        // bonus dice
        if( this.data.bonusDice ) mods.push( { type : 'bonusDice', text : `Units gain +${this.data.bonusDice} extra dice`, val : this.data.bonusDice });

        return this.factionCombatMods( mods, area );
    }

};

module.exports = mixin;
