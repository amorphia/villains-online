let Faction = require( './Faction' );


class Swarm extends Faction {
    name = 'swarm';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.focusDescription = "Have units in many areas";
        this.data.title = "The Swarm";
        this.data.factionDefenseBonus = 0; // the negative modifier we apply to enemy die rolls
        this.data.hatchCount = 4; // how many drones to hatch
        this.data.bonusDeploy = { type: 'champion', count : 1 }; // our champion doesn't use up deploy limit

        this.triggers = {
            "onAfterCombatStep" : "hatchBroodnest"
        };

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


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ) {
        this.data.factionDefenseBonus = upgrade;
    }


    /**
     * hatch broodnests
     */
    async hatchBroodnest() {
        // is our broodnest in play?
        let broodnest = this.getChampionInPlay();
        if ( !broodnest ) return;

        // place our drones
        try {
            await this.hatchDrones( broodnest.location );
        } catch( error ){
            console.error( error );
        }

        // return broodnest to our reserves
        broodnest.location = null;
    }


    /**
     * Spawn our drone units into the broodnest's areas
     *
     * @param area
     */
    async hatchDrones( area ) {
        area = this.game().areas[area];

        let units = [];

        // add drones equal to our match count
        for( let i = 0; i < this.data.hatchCount; i++ ){
            units.push( this.placeDrone( area ) );
        }

        // send out the birth announcements
        this.game().sound( 'hatch' );
        let message = `Broodnest hatches, spawning ${this.data.hatchCount} <span class="faction-swarm">drones</span> in The ${area.name}`;
        this.message( message );

        await this.game().timedPrompt('units-shifted', {
            message : `The Swarm Broodnest hatches, spawning drones in the ${area.name}`,
            units: units
        }).catch( error => console.error( error ) );
    }


    /**
     * Place a drone unit in the given area
     *
     * @param area
     * @returns {object}
     */
    placeDrone( area ){
        let drone = this.data.units.find( unit => _.unitInReserves( unit, { type : 'drone' } ) );
        drone.location = area.name;
        return drone;
    }


    /**
     * Can we activate our scatter token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateScatter( token, area ) {
        // is this area not trapped, and do we have units other than our champion here?
        return !area.isTrapped( this ) && this.unitsInArea( area ).filter( unit => unit.type !== 'champion' ).length;
    }


    /**
     * Resolve our scatter token
     *
     * @param args
     * @returns {Promise<void>}
     */
    async activateScatterToken( args ) {

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


    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {

        mods.push({
            type: 'goonDeflect',
            text: `Units attacking The Swarm throw one fewer dice (to a minimum of 1)`
        });

        // if we don't have any faction defense bonus, then we are done here
        if( !this.data.factionDefenseBonus ) return mods;

        // see if we already have other defense bonuses
        let existingMod = mods.find(mod => mod.type === 'defenseBonus');

        // if we already have a defense bonus mod, just change the value
        if (existingMod) {
            existingMod.val += this.data.factionDefenseBonus;
            existingMod.text = `Enemies suffer -${existingMod.val} to their attack rolls`
        } else {
            // otherwise add the defense mod whole
            mods.push({
                type: 'defenseBonus',
                text: `Enemies suffer ${this.data.factionDefenseBonus} to their attack rolls`,
                val: this.data.factionDefenseBonus
            });
        }

        return mods;
    }
}




module.exports = Swarm;
