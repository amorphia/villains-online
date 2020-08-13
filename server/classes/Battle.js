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

    async ninjaAttack( faction ){
        let player = {}, data = {};

        [player, data] = await this.game().promise({
            players: faction.playerId,
            name: 'ninja-attack',
            data : { area : this.area.name }
        }).catch( error => console.error( error ) );

        if( !data.ninjaAttack ) return;

        let result = await faction.attack({
                area : this.area,
                attacks : [5],
                chooseUnitTarget : true
        }).catch( error => console.error( error ) );

        if(
            result
            && result.hits
            && this.stillHasEnemiesThatCanAttack( faction )
            && faction.hasNonHiddenUnitsInArea( this.area )
        ){
            [player, data] = await this.game().promise({
                players: faction.playerId,
                name: 'choose-units',
                data : {
                    count : 1,
                    areas : [this.area.name],
                    playerOnly : true,
                    message: "Choose a unit to become hidden"
                }
            }).catch( error => console.error( error ) );
            if( !data.units ) return;

            let unit = this.game().objectMap[ data.units[0] ];
            faction.becomeHidden( unit );
        }

        this.lastAttack = result;
        faction.data.units.forEach( unit => unit.needsToAttack = false );
    }

    async makeAttacks( factionData ){
        let player, data, gameFaction = this.game().factions[factionData.name];

        if( gameFaction.name === 'ninjas' && this.stillHasUnitsToAttack( factionData, true ) ){
            try {
                await this.ninjaAttack( gameFaction );
            } catch( error ){
                console.error( error );
            }
        }

        while( this.stillHasUnitsToAttack( factionData ) ){

            [player, data] = await this.game().promise({
                players: gameFaction.playerId,
                name: 'choose-units',
                data : {
                    count : 1,
                    areas : [this.area.name],
                    needsToAttack: true,
                    playerOnly : true,
                    message: "Choose a unit to make an attack"
                }
            }).catch( error => console.error( error ) );

            if( !data.units ) return;
            let unit = this.game().objectMap[ data.units[0] ];

            this.data.currentUnit = unit.id;

            // resolve attack with that unit
            let area = this.game().areas[ unit.location ];
            await gameFaction.attack({
                area : area,
                attacks : unit.attack,
                unit : unit,
                attackBonus : this.options.attackBonus
            }).catch( error => console.error( error ) );

            unit.needsToAttack = false;
            this.data.currentUnit = null;
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
                    units: unitsInArea,
                    mods: faction.combatModifiersList( this.area ),
                    order : faction.playerOrder()
                })
            }
        });

        this.data.factions.sort( (a,b) => {
            if( a.name === 'ninjas' ) return -1;
            return a.order - b.order
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
