let Faction = require( './Faction' );


class Conquistadors extends Faction {
    name = 'conquistadors';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onControlArea" : "conquerArea"
        };

        //data
        this.data.name = this.name;
        this.data.title = "Los Conquistadores";
        this.data.bonusDeploy = {type: 'goon', count: 10};
        this.data.bonusDiceInUnconquered = 0;
        this.data.conqueredAreas = [];
        this.data.focusDescription = "Conquer many areas";

        this.capturedRewards = [
            { ap : 1, cardDraw : 1 },
            { ap : 1, cardDraw : 1 },
            { ap : 1 },
            { ap : 2 },
        ];

        // tokens
        this.tokens['move'].count = 2;
        this.tokens['card'].count = 4;

        this.tokens['pox'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'pox',
                cost: 0,
                resource: 1,
                description: 'after the combat step each player must sacrifice a unit in this area for each killed unit they have here',
                req : "this token must be discarded if it fails to kill any units"
            }
        };

        // units
        // unit count: 21

        this.units['goon'].count = 10;
        this.units['patsy'].count = 6;
        this.units['talent'].count = 5;
        delete this.units['mole'];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Diego",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [2],
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onDeploy: 'addCombatMarker',
                onMove: 'addCombatMarker',
            }
        };
    }


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ) {
        this.data.bonusDiceInUnconquered = upgrade;
    }


    /**
     * Returns the number of resources we collect each collect resources step
     *
     * @returns {number}
     */
    resourcesToCollect(){
        let resources = super.resourcesToCollect();
        resources += this.data.conqueredAreas.length;
        return resources;
    }


    /**
     * Conquer an area
     *
     * @param area
     */
    conquerArea( area ){
        if( area.data.conquered ) return;

        area.data.conquered = true;
        this.data.conqueredAreas.push( area.name );
        this.message( `Conquers The ${area.name}` );
    }


    /**
     * Can we activate our pox token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivatePox( token, area ) {
        // are there any enemy units in this area?
        let enemyUnits = this.enemyUnitsInArea( area, { basic : true } );
        return Object.keys( enemyUnits ).length > 0;
    }


    /**
     * Handle activating our Pox token
     *
     * @param args
     */
    async activatePoxToken( args ) {

        let promises = [];
        let units = [];

        this.message( `The Pox descends on the ${args.area.name}` );

        // ask each player which unit they want to sacrifice
        _.forEach( this.game().factions, faction => {
            promises.push( this.factionChoosePoxVictim( faction, units, args ) );
        });

        await Promise.all( promises )
            .catch( error => console.log( error ) );

        // if we killed any units, then display the results
        if( units.length ){
            await this.game().timedPrompt('units-shifted', {
                message: `The Pox killed the following units`,
                units: units
            });
        }

        // advance the game
        this.game().advancePlayer();
    }


    /**
     * allow a player to choose which unit to sacrifice to our pox token
     *
     * @param faction
     * @param units
     * @param args
     * @returns {Promise<void>}
     */
    factionChoosePoxVictim( faction, units, args ) {
        // only opponents are effected
        if( faction.name === this.name ) return;

        // if opponent has no units skip them
        if( ! faction.data.units.find( unit => _.unitInArea( unit, args.area, { basic : true } ) ) ) return;

        return this.game().promise({
            players: faction.playerId,
            name: 'sacrifice-units',
            data : {
                count : 1,
                basicOnly : true,
                areas : [ args.area.name ]
            }
        }).then( async ([player, response]) => await this.killPoxUnit( player, response, units, faction ) );
    }


    /**
     * Kill a poxed unit
     *
     * @param player
     * @param response
     * @param units
     * @param faction
     */
    async killPoxUnit( player, response, units, faction ){
        // get the unit
        let unit = this.game().objectMap[response.units[0]];
        units.push( unit );

        // kill the unit
        await this.game().killUnit( unit, this );

        // display the response and set our player prompt
        this.game().message({ faction : faction, message : `sacrifices <span class="faction-${faction.name}item">${unit.name}</span>` });
        player.setPrompt({ active : false, updatePlayerData : true });
    }


    /**
     * Handle Diego's enter area battle marker trigger
     *
     * @param event
     */
    addCombatMarker( event ) {
        let area = this.game().areas[event.unit.location];

        // if we already have a battle marker, abort
        if (area.data.battle) return;

        // add battle marker
        area.data.battle = true;
        this.message( `<span class="faction-conquistadors">Diego</span> adds a combat marker to The ${area.name}` );
    }


    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {

        // upgrade bonus dice in unconquered areas
        if ( !area.data.conquered  && this.data.bonusDiceInUnconquered ) {
            let existingMod = mods.find(mod => mod.type === 'bonusDice');
            if (existingMod) {
                existingMod.val += this.data.bonusDiceInUnconquered;
                existingMod.text = `Units gain  -${existingMod.val} extra dice`
            } else {
                mods.push( { type : 'bonusDice', text : `Units gain +${this.data.bonusDiceInUnconquered} extra dice`, val : this.data.bonusDiceInUnconquered });
            }
        }

        return mods;
    }

}




module.exports = Conquistadors;
