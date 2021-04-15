let Faction = require( './Faction' );


class Plants extends Faction {
    name = 'plants';

    constructor(owner, game) {
        super(owner, game);

        // triggered events
        this.triggers = {
            "onAfterCombatStep" : "sproutPlants",
            "onCleanUp" : "removePlantsFromUnitMix"
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Reclamation of Gaia";
        this.data.focusDescription = "Have many enemy units in your areas";
        this.data.maxEnergy = 8;
        this.data.flipableUnits = ['champion'];
        this.data.additionalUnitIcon = ['plant'];

        // used to store additional word tokens before the appropriate upgrade is scored
        this.data.vines = [];

        // used to record the areas we have created plants
        this.data.plants = {};


        // tokens
        this.tokens['vines'] = {
            count: 3,
            data: {
                influence: 2,
                type: 'vines',
                cost: 0,
                areaStat : true,
                req : "Passive token: this token may always be activated"

            }
        };

        // units
        this.units['goon'].count = 2;
        this.units['mole'].count = 6;
        this.units['talent'].count = 4;
        this.units['patsy'].count = 8;
        this.units['patsy'].data.influence = 1;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Soul",
                type: 'champion',
                basic: false,
                influence: 3,
                attack: [],
                toughness: true,
                flipped: false,
                skilled: true,
                ready: false,
                cost: 1,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onSkill : 'soulLure',
            }
        };
    }


    /**
     * Process faction upgrade
     */
    processUpgrade() {
        // add additional vines tokens to our reserves
        this.upgradeVariableTokens( this.data.vines );
    }


    /**
     * Returns array of factions which have one or more patsies adjacent to the given area
     *
     * @param area
     * @returns {string[]}
     */
    factionsWithAdjacentPatsies( area ){
        let factions = {};

        area.data.adjacent.forEach( areaName => {
            Object.values( this.game().factions ).forEach( faction => {
                // don;t include ourselves
                if( faction.name === this.name ) return;

                // check for a patsy
                if( faction.typeInArea( "patsy", area ) ){
                    factions[ faction.name ] = true;
                }
            });
        });

        return Object.keys( factions );
    }


    /**
     * Handle our champion skill trigger to lure enemy patsies to this area
     *
     * @param event
     */
    async soulLure( event ){
        let units = [], area = this.game().areas[event.unit.location];

        this.message( `The Soul of the Green begins to sing...` );

        // get our possible factions to lure, if we have none, then abort
        let factions = this.factionsWithAdjacentPatsies( area );
        if( !factions.length ) return this.message( 'No adjacent patsies to lure', { class : 'warning' });

        try {
            // for each faction  cycle through and allow them to choose a patsy to lure
            let promises = [];
            for( let factionName of factions ) {
                promises.push( this.factionChooseSoulLure( this.game().factions[factionName], units, area ) );
            }

            // wait for everyone to finish
            await Promise.all( promises );

            // display the moved patsies
            await this.game().timedPrompt('units-shifted', {
                message: `Patsies were lured to The ${area.name}`,
                units: units
            });

        } catch( error ){
            console.error( error );
        }
    }


    /**
     * Allow an opponent to choose a patsy to lure
     *
     * @param faction
     * @param units
     * @param area
     */
    factionChooseSoulLure( faction, units, area ){
        let player, response;
        let factionAreas = faction.areasWithUnits({ adjacent : area.data.adjacent, types : ['patsy'] });

        let data = {
            count : 1,
            areas : factionAreas,
            unitTypes : ['patsy'],
            playerOnly : true,
            message : `Choose a patsy to move to The ${area.name}`
        };

        return this.game().promise({ players: faction.playerId, name: 'choose-units', data : data })
            .then( async ([player, response]) => { this.handleSoulLureResponse( player, response, area, units )});
    }


    /**
     * Handle a faction's soul lure response
     *
     * @param player
     * @param response
     * @param area
     * @param units
     */
    async handleSoulLureResponse( player, response, area, units ){
        let unit = this.game().objectMap[response.units[0]];

        unit.location = area.name;
        if( unit.ready ) unit.ready = false;
        units.push( unit );

        player.setPrompt({ active : false, updatePlayerData : true });
    }


    /**
     * Permanently remove each unit we've converted to plant from our unit pool
     */
    removePlantsFromUnitMix() {
        // plant units are removed from your unit pool
        this.data.units = this.data.units.filter( unit => !unit.plant );
    }


    /**
     * Handle converting our killed units into plants
     */
    async sproutPlants(){

        this.message( `The Plants must choose which dead shall be reborn into Gaia's embrace` );

        // get the areas where we have a killed unit to convert, and if we have no areas abort
        let areas = this.areasWithDeadUnits();
        if( !areas.length ) return this.message('Have no killed units to convert into plants', { class : 'warning' });

        // cycle through each area and convert
        for( let area of areas ){
            await this.choosePlantConvert( area );
        }
    }


    /**
     * Choose a killed unit to convert to a plant
     *
     * @param area
     */
    async choosePlantConvert( area ){

        let data = {
            count : 1,
            areas : [area],
            playerOnly : true,
            killedOnly : true,
            canDecline : true,
            basicOnly : true,
            message: `choose a killed unit in The ${area} to transform into a plant`
        };

        // prompt player to choose a unit to convert
        let response = await this.prompt('choose-units', data );

        // if we decline to convert a unit, then abort
        if( response.decline ){
            this.message( `The Plants decline to seed The ${area}` );
            return;
        }

        // make our chosen unit a plant
        let unit = this.game().objectMap[response.units[0]];
        this.becomePlant( unit );
    }


    /**
     * Convert a unit to a plant
     *
     * @param unit
     */
    becomePlant( unit ){
        let area = unit.location;
        unit.plant = true;

        // if we already have plants here, increment our plant count, otherwise create property for this area
        this.data.plants[area] = this.data.plants[area] + 1 || 1;

        this.message( `The Plants' ${unit.type} in The ${area} is reborn from Gaia's touch` );
    }


    /**
     * Can we activate our vines token?
     *
     * @returns {boolean}
     */
    canActivateVines() {
        // but of course we can
        return true;
    }


    /**
     * Handle activating a vines token
     */
    activateVinesToken() {
        // welp, that was easy
        this.game().advancePlayer();
    }


    /**
     * Remove the vines tokens we haven't unlocked yet from our reserves
     */
    onSetup(){
        this.setupVariableTokens( 'vines', this.data.vines );
    }

}


module.exports = Plants;
