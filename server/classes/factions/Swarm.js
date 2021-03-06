let Faction = require( './Faction' );


class Swarm extends Faction {
    name = 'swarm';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.focus = 'unit-areas-focus';
        this.data.focusDescription = "Have units in many areas";
        this.data.title = "The Swarm";
        this.data.factionDefenseBonus = 0;
        this.data.hatchCount = 4;
        this.data.bonusDeploy = { type: 'champion', count : 1 };

        // tokens
        this.tokens['deploy'].count = 4;

        this.tokens['scatter'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'scatter',
                cost: 0,
                resource: 1,
                req : "This token must be discarded if you don't move any units"
            }
        };



        // units
        this.units['patsy'].count = 6;
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
            }
        };
    }

    factionCombatMods( mods, area ) {

        mods.push({
            type: 'goonDeflect',
            text: `Units attacking The Swarm throw one fewer dice (to a minimum of 1)`
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

    async onAfterCombatStep() {
        let broodnest = this.data.units.find( unit => unit.type === 'champion' && _.unitInPlay( unit ) );
        if ( !broodnest ) return;

        try {
            await this.placeDrones( broodnest.location );
        } catch( error ){
            console.error( error );
        }

        broodnest.location = null;

    }

    async placeDrones( area ) {
        area = this.game().areas[area];

        let units = [];

        for( let i = 0; i < this.data.hatchCount; i++ ){
            units.push( this.placeDrone( area ) );
        }

        this.game().sound( 'hatch' );
        let message = `Broodnest hatches, spawning ${this.data.hatchCount} <span class="faction-swarm">drones</span> in The ${area.name}`;
        this.game().message({ faction : this, message: message });

        await this.game().timedPrompt('units-shifted', {
            message : `The Swarm Broodnest hatches, spawning drones in the ${area.name}`,
            units: units
        }).catch( error => console.error( error ) );
    }

    /*
    deployPlaceDrone( event ) {
        let area = this.game().areas[event.unit.location];
        this.placeDrone( area )
    }
    */

    placeDrone( area ){
        let drone = this.data.units.find( unit => unit.type === 'drone' && _.unitInReserves( unit ) );
        drone.location = area.name;
        return drone;
    }


    canActivateScatter( token, area ) {
        return !area.isTrapped( this ) && this.unitsInArea( area ).filter( unit => unit.type !== 'champion' ).length;
    }

    async scatterToken( args ) {

        try {
            await this.moveAwayToken( args, {
                fromArea: args.area.name,
                toAreas: args.area.getDeployableAdjacentAreas(),
                noChampion : true,
                message : 'Choose units to scatter',
                promptMessage: 'The Swarm units scatter from The ' + args.area.name,
                sound : 'hatch'
            });
        } catch( error ){
            console.error( error );
        }


        this.game().advancePlayer();
    }
}




module.exports = Swarm;
