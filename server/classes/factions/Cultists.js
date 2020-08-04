let Faction = require( './Faction' );


class Cultists extends Faction {
    name = 'cultists';

    constructor(owner, game) {
        super(owner, game);

        // data
        this.data.maxEnergy = 4;
        this.data.tokenCost = 0;
        this.data.name = this.name;
        this.data.title = "The Church of Doom";

        // tokens
        this.tokens['nothing'] = {
            count: 4,
            data: {}
        };
        delete this.tokens['battle'];

        // units
        this.units['goon'].count = 6;
        this.units['goon'].data.influence = 0;
        this.units['patsy'].count = 6;
        this.units['patsy'].data.attack = [7];
        this.units['talent'].count = 6;
        this.units['talent'].data.influence = 0;
        delete this.units['mole'];


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Basta, Robed in Night",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [],
                cost: 0,
                killed: false,
                onDeploy: 'bastaSacrifice',
                onMove: 'bastaSacrifice',
                selected : false,
                hitsAssigned : 0
            }
        };
    }

    factionCombatMods( mods, area ) {

        if( this.data.upgrade ){
            mods.push({
                type: 'patsies',
                text: `Patsies throw ${this.data.upgrade} additional dice`
            });
        }

        mods.push( { type : 'cultistInfluence', text : `Gains xIx for each kill` });
        return mods;
    }

    async bastaSacrifice( event ){
        let player, data, message;
        if( !event.from || event.from === event.unit.location ) return;
        let area = event.from;

        message = `Choose player to target with Basta`;
        let targetFaction = await this.selectEnemyPlayerWithUnitsInArea( area, message, {} );
        if( !targetFaction ){
            this.game().message({ faction : this, message: "No souls for Basta to claim", class : 'warning' });
            return;
        }

        this.game().sound( 'basta' );
        message = `<span class="faction-${targetFaction.name}">the ${targetFaction.name}</span> must pay tribute to Basta`;
        this.game().message({ faction: targetFaction, message: message });


        let enemyUnits = _.factionUnitsInArea( targetFaction, area );
        let unit;

        // player sacrifices
        if( enemyUnits.length !== 1 ){
            [player, data] = await this.game().promise({ players: targetFaction.playerId, name: 'sacrifice-units', data : { count : 1, areas : [event.from]  } });
            unit = this.game().objectMap[ data.units[0] ];
        } else {
            unit = enemyUnits[0];
        }

        await this.game().killUnit( unit, this );

        message = `sacrifices <span class="faction-${unit.faction}">${unit.name}</span> in the ${event.from}`;
        this.game().message({ faction: targetFaction, message: message });

    }

    processUpgrade( n ){
        this.data.units.forEach( unit => {
            if( unit.type === 'patsy' ){
                unit.attack = n === 1 ? [7,7] : [7,7,7];
            }
        });
    }

    canActivateNothing(){
        return false;
    }

    onSetup(){
    }
}


module.exports = Cultists;
