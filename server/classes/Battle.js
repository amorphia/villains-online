class Battle {
    gameId;
    area;
    options;

    data = {
        factionIndex : 0,
        areaName : null,
        currentUnit : null,
        attackingUnits : {},
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
    }

    async init(){
        if( !this.area.canBattle() ){
            this.game().message({ message : `Unable to battle in the ${this.area.name}` , class : 'warning' });
            return;
        }

        this.game().sound( 'combat' );
        this.makeFactionsList();
        await this.resolve();
    }


    async resolve(){
        for( let i = 0; i < this.data.factions.length; i++ ){
            let faction = this.data.factions[i];
            this.data.factionIndex = i;
            this.game().message({ faction : faction.name, message : `start their attacks` });
            await this.makeAttacks( faction );
            this.game().message({ faction : faction.name, message : `have completed their attacks` });
        }
        this.data.factionIndex++;
        this.data.completed = true;
    }

    async makeAttacks( factionData ){
        let player, data, gameFaction = this.game().factions[factionData.name];

        while( this.stillHasUnitsToAttack( factionData ) ){
            [player, data] = await this.game().promise({ players: gameFaction.playerId, name: 'choose-units', data : { count : 1, areas : [this.area.name], needsToAttack: true, playerOnly : true,  message: "Choose a unit to make an attack" }});
            let unit = this.game().objectMap[ data.units[0] ];

            this.data.currentUnit = unit.id;

            // resolve attack with that unit
            let area = this.game().areas[ unit.location ];
            let attackResult = await gameFaction.attack( { area : area, attacks : unit.attack, unit : unit, attackBonus : this.options.attackBonus } );

            if( attackResult ){
                this.data.lastAttack = attackResult;
                this.data.attacks[attackResult.unit] = attackResult;
            }

            unit.needsToAttack = false;
            this.data.currentUnit = null;
        }

        factionData.units.forEach( unit => {
            if( unit.needsToAttack ) unit.needsToAttack = false
        });
    }

    stillHasUnitsToAttack( faction ){
        let unit = _.find( faction.units, unit => unit.needsToAttack );
        let enemyUnits = this.game().factions[faction.name].hasEnemyUnitsInArea( this.area );
        return unit && enemyUnits;
    }

    game(){
        return Server.games[this.gameId];
    }

    makeFactionsList(){
        _.forEach( this.game().factions, faction => {
            let unitsInArea = _.factionUnitsInArea( faction, this.area.name );

            if( unitsInArea.length ) {
                unitsInArea.forEach( unit => {
                    if( unit.attack.length ) unit.needsToAttack = true
                });

                this.data.factions.push({
                    name: faction.name,
                    units: unitsInArea,
                    mods: faction.combatModifiersList( this.area ),
                    order : faction.playerOrder()
                })
            }
        });

        this.data.factions.sort( (a,b) => a.order - b.order );
    }

}

module.exports = Battle;
