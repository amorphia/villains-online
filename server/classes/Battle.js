class Battle {
    gameId;
    area;
    options;

    data = {
        title : '',
        factionIndex : 0,
        attackBonus : null,
        areaName : null,
        currentUnit : null,
        factions : [],
        attacks : {},
        lastAttack : null,
        completed : false
    };

    constructor( area, game, options = {} ) {
        this.area = area;
        this.data.areaName = area.name;
        this.gameId = game.id;
        this.options = options;
        if( this.options.attackBonus ) this.data.attackBonus = this.options.attackBonus;
    }

    async init(){
        if( !this.area.canBattle() ){
            this.game().message({
                message : `Unable to battle in the ${this.area.name}`,
                class : 'warning'
            });
            return;
        }

        this.game().sound( 'combat' );

        try{
            await this.resolveBattle();
        } catch( error ){
            console.error( error );
        }

    }

    hasFirstStrikeUnits(){
        let areaUnits = this.area.units();
        return areaUnits.filter( unit => unit.firstStrike ).length > 0;
    }


    async resolveBattle(){

        if( this.game().factions['ninjas'] ) this.game().factions['ninjas'].data.firstAttackThisBattle = true;

        if( this.hasFirstStrikeUnits() ){
            console.log( 'resolving first strike phase' );

            try{
                await this.resolveStrikePhase( true );
            } catch( error ){
                console.error( error );
            }

        }

        if( this.area.canBattle() ){
            console.log( 'resolving regular strike phase' );

            try{
                await this.resolveStrikePhase();
            } catch( error ){
                console.error( error );
            }
        }

        try {
            for( let faction of Object.values( this.game().factions ) ){
                await faction.onAfterBattle( this );
            }
        } catch( error ){
            console.error( error );
        }

        this.data.title = 'Battle completed';
        this.data.completed = true;
    }

    async resolveStrikePhase( firstStrikePhase ){

        this.data.factionIndex = 0;
        this.data.currentUnit = null;
        this.data.factions = [];
        this.data.title = firstStrikePhase ? 'Resolving First Strike Attacks' : 'Resolving Attacks';

        this.makeFactionsList( firstStrikePhase );

        for( let i = 0; i < this.data.factions.length; i++ ){
            let faction = this.data.factions[i];
            this.data.factionIndex = i;

            this.game().message({
                faction : faction.name,
                message : `start their ${ firstStrikePhase ? 'first strike ' : '' }attacks`
            });

            try {
                await this.makeAttacks( faction );
            } catch( error ){
                console.error( error );
            }

            this.game().message({
                faction : faction.name,
                message : `have completed their ${ firstStrikePhase ? 'first strike ' : '' }attacks`
            });
        }
        this.data.factionIndex++;

    }

    stillHasEnemiesThatCanAttack( faction ){
        for( let fac of this.data.factions ){
            if( fac.name === faction.name ) continue;
            if( fac.units.find( unit => unit.needsToAttack ) ) return true;
        }
    }


    async makeAttacks( factionData ){
        let player, data, gameFaction = this.game().factions[factionData.name];

        while( this.stillHasUnitsToAttack( factionData ) ){
            let ninjaAttack = gameFaction.name === 'ninjas' && gameFaction.data.firstAttackThisBattle;

            [player, data] = await this.game().promise({
                players: gameFaction.playerId,
                name: 'choose-units',
                data : {
                    count : 1,
                    areas : [this.area.name],
                    needsToAttack: true,
                    playerOnly : true,
                    message: "Choose a unit to make an attack",
                    gainsSeeking : ninjaAttack,
                }
            }).catch( error => console.error( error ) );

            if( !data.units ) return;
            let unit = this.game().objectMap[ data.units[0] ];

            this.data.currentUnit = unit.id;

            // resolve attack with that unit
            let area = this.game().areas[ unit.location ];

            let attackArgs = {
                area : area,
                attacks : unit.attack,
                unit : unit,
                attackBonus : this.options.attackBonus,
            };

            // if ninjas haven't attacked yet then this attack gains seeking
            if( ninjaAttack ) attackArgs.seeking = true;

            await gameFaction.attack( attackArgs ).catch( error => console.error( error ) );

            unit.needsToAttack = false;
            this.data.currentUnit = null;

            // mark that ninjas have attacked
            if( ninjaAttack ) gameFaction.data.firstAttackThisBattle = false;
        }

        factionData.units.forEach( unit => {
            if( unit.needsToAttack ) unit.needsToAttack = false
        });
    }

    stillHasUnitsToAttack( faction, basic ){
        let unit = _.find( faction.units, unit => unit.needsToAttack );
        let enemyUnits = this.game().factions[faction.name].hasEnemyUnitsInArea( this.area, { basic : basic, notHidden : true } );
        return unit && enemyUnits;
    }

    game(){
        return Server.games[this.gameId];
    }

    makeFactionsList( firstStrikePhase ){
        _.forEach( this.game().factions, faction => {
            let unitsInArea = _.factionUnitsInArea( faction, this.area.name );

            if( unitsInArea.length ) {
                unitsInArea.forEach( unit => {
                    if( firstStrikePhase ){
                        if( unit.firstStrike && unit.attack.length ) unit.needsToAttack = true;
                    } else {
                        if( !unit.firstStrike && unit.attack.length ) unit.needsToAttack = true;
                    }
                });

                this.data.factions.push({
                    name: faction.name,
                    playerId : faction.playerId,
                    units: unitsInArea,
                    mods: faction.combatModifiersList( this.area ),
                    order : faction.playerOrder()
                })
            }
        });

        let playerOrder = this.game().data.playerOrder;

        this.data.factions.sort( (a,b) => {
            return playerOrder.indexOf( a.playerId ) - playerOrder.indexOf( b.playerId );
        });

        Object.values( this.game().factions ).forEach( fac => {
            fac.battleOrderSort( this.data.factions );
        });


    }

    removeUnitFromCombat( unit ){
        if( unit.needsToAttack ) unit.needsToAttack = false;
        for( let faction of this.data.factions ){
            if( faction.name !== unit.faction ) continue;
            faction.units = faction.units.filter( item => item.id !== unit.id );
        }
    }

}

module.exports = Battle;
