let Faction = require( './Faction' );


class Loyalists extends Faction {
    name = 'loyalists';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "Her Majesty's Loyalists";
        this.data.knightCount = 2;

        // tokens
        this.tokens['knight'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'knight',
                cost: 0,
                resource : 1,
            }
        };

        // units
        this.units['patsy'].count = 3;

        this.units['servant'] = {
            count: 2,
            data: {
                name: "servant",
                type: "servant",
                basic: false,
                cost: 0,
                noDeploy: true,
                influence: 0,
                attack: [9],
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Her Majesty",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [],
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onDeploy: 'placeServants',
                onKilled: 'queenDeath'
            }
        };
    }

    factionCombatMods(mods, area) {
        if (this.data.units.find(unit => _.unitInArea(unit, area, 'champion'))) {
            mods.push({
                type: 'queenDeath',
                text: `If Her Majesty dies, her killer may replace any loyalist unit in play with a matching one from their reserves`
            });
        }

        return mods;
    }

    processUpgrade(n) {
        switch (n) {
            case 2 :
                this.data.knightCount = 4;
                break;
            case 1 :
                this.data.knightCount = 3;
                break;
        }
    }

    placeServants( event ){
        this.data.units.forEach( unit => {
           if( unit.type === 'servant' && !unit.killed ) unit.location = event.unit.location;
        });
    }

    async queenDeath( event ){
        let player, data;

        let killer = this.game().factions[ event.unit.killed ];
        let killerOptions = killer.unitTypesInReserves( true );
        let victimOptions = this.unitTypesInPlay( true );
        let potentialTypes = _.intersection( killerOptions, victimOptions );
        let potentialAreas = this.areasWithUnits( potentialTypes );

        this.game().sound( 'queendeath' );
        this.game().message({ faction : killer, message: `Have <span class="highlight">committed regicide</span>! The Queenslayers must now collect their bounty` });


        if( !potentialTypes.length ){
            this.game().message({ faction : this, message: "The Queenslayers have no valid units to replace", class : 'warning' });
            return;
        }

        [player, data] = await this.game().promise({ players: killer.playerId, name: 'choose-units', data : { count : 1, areas : potentialAreas, belongsTo : this.name, unitTypes : potentialTypes, message: 'Choose a loyalist unit to replace'  } });
        let unit = this.game().objectMap[ data.units[0] ];

        let message = `Replaces <span class="faction-loyalists">The Loyalist ${unit.name}</span> in the ${unit.location}`;
        this.game().message({ faction : killer, message: message });
        killer.replaceUnit( unit );
    }

    canActivateKnight( token, area ) {
        return !! this.data.units.find( unit => this.knightable( unit, area ) );
    }

    knightable( unit, area ){
        if( typeof area !== 'string' ) area = area.name;
        return ! unit.flipped
               && unit.location === area
               && unit.basic;
    }

    async knightToken( args ) {
        let data, player;

        // creat an array of IDs for all of the knightable units in this area
        let knightableUnitIds = this.data.units.filter( unit => this.knightable( unit, args.area ) ).map( unit => unit.id );

        if( knightableUnitIds.length > this.data.knightCount ){ // if we have more units here that could be knighted then we can knight, choose which ones
            [player, data] = await this.game().promise({ players: this.playerId, name: 'choose-units', data : { count : this.data.knightCount, areas : [args.area.name], unitList: knightableUnitIds, playerOnly : true, message: "Choose units to knight" }});
            knightableUnitIds = data.units;
        }

        // process knighthood
        let unitNames = [];
        knightableUnitIds.forEach( unitId => {
            let unit = this.game().objectMap[unitId];
            this.knightUnit( unit );
            unitNames.push( unit.name );
        });

        let message = `Knights <span class="highlight">${ unitNames.join(', ') }</span> in the ${args.area.name}`;
        this.message({ message: message, faction : this });

        this.game().advancePlayer();
    }

    knightUnit(unit) {
        unit.flipped = true;
        unit.firstStrike = true;
        unit.influence++;
    }

    unitUnflipped(unit) {
        unit.firstStrike = false;
        unit.influence--;
    }

}


module.exports = Loyalists;
