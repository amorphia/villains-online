let Faction = require( './Faction' );


class Swarm extends Faction {
    name = 'swarm';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Swarm";
        this.data.factionDefenseBonus = 0;

        // tokens
        this.tokens['scatter'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'scatter',
                cost: 0,
                resource: 1,
            }
        };

        // units
        this.units['patsy'].count = 3;
        this.units['goon'].count = 3;
        this.units['mole'].count = 3;

        this.units['drone'] = {
            count: 16,
            data: {
                name: "drone",
                type: "drone",
                basic: false,
                cost: 0,
                noDeploy: true,
                influence: 1,
                attack: [6],
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Broodnest",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [],
                cost: 2,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onKilled: 'returnUnitToReserves'
            }
        };
    }

    factionCombatMods( mods, area ) {

        mods.push({
            type: 'goonDeflect',
            text: `Goons attacking The Swarm throw one fewer dice`
        });

        if ( this.data.factionDefenseBonus ) {
            let existingMod = mods.find(mod => mod.type === 'defenseBonus');
            if (existingMod) {
                existingMod.val += this.data.factionDefenseBonus;
                existingMod.text = `Enemies suffer -${existingMod.val} to their attack rolls`
            } else {
                mods.push({
                    type: 'defenseBonus',
                    text: `Enemies suffer ${this.data.factionDefenseBonus} to their attack rolls`,
                    val: this.data.factionDefenseBonus
                });
            }
        }

        return mods;
    }

    processUpgrade( n ) {
        this.data.factionDefenseBonus = n;
    }

    afterCombatStep() {
        let broodnest = this.data.units.find( unit => unit.type === 'champion' && _.unitInPlay( unit ) );
        if ( !broodnest ) return;

        this.placeDrones( broodnest.location );
        broodnest.location = null;

    }

    placeDrones( area ) {
        area = this.game().areas[area];

        for( let i = 0; i < 4; i++ ){
            let drone = this.data.units.find( unit => unit.type === 'drone' && _.unitInReserves( unit ) );
            drone.location = area.name;
        }

        this.game().sound( 'hatch' );
        let message = `Broodnest hatches, spawning four drones in <span class="highlight">The ${area.name}</span>`;
        this.game().message({ faction : this, message: message });
    }

    canActivateScatter( token, area ) {
        return !area.isTrapped( this ) && this.unitsInArea( area ).filter( unit => unit.type !== 'champion' ).length;
    }

    async scatterToken( args ) {
        await this.moveAwayToken( args, {
            fromArea: args.area.name,
            toAreas: args.area.data.adjacent,
            noChampion : true,
            message : 'Choose units to scatter'
        });

        this.game().sound( 'hatch' );
        this.game().advancePlayer();
    }
}




module.exports = Swarm;