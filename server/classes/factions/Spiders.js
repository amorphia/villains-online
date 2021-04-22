let Faction = require( './Faction' );


class Spiders extends Faction {
    name = 'spiders';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onFactionKillsUnit" : "webKilledUnit",
            "onStartOfTurnSerial" : "freeUnitsFromWebs",
            "onBeforeBattle" : "deployXchxchAmbushUnits"
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Eyes of the Woods";
        this.data.focusDescription = "Trap enemy units in webs";
        this.data.dropDeploy = 1; // how many spider do we place with our Drop token?
        this.data.xchxchDeploy = 1; // how many spiders do we place at the start of combat with xchxch?
        this.data.webs = []; // where we store our webbed victims

        // tokens
        delete this.tokens['battle'];

        this.tokens['drop'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'drop',
                cost: 0,
                resource : 1,
                req : "To avoid discarding this token you must place at least one spider, or start a battle"
            }
        };

        // units
        this.units['goon'].count = 3;
        this.units['mole'].count = 4;
        this.units['patsy'].count = 6;

        this.units['spider'] = {
            count: 8,
            data: {
                name: "spider",
                type: "spider",
                basic: false,
                cost: 0,
                noDeploy: true,
                influence: 0,
                attack: [5],
                deadly : true,
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Xchxch",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [5],
                deadly: true,
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
        if( upgrade === 1 ){
            this.data.dropDeploy = 2;
        }

        if( upgrade === 2 ){
            this.data.dropDeploy = 2;
            this.data.xchxchDeploy = 2;
        }
    }


    /**
     * Web any units killed by this faction
     *
     * @param unit
     */
    async webKilledUnit( unit ){
        if( unit.faction === this.name ) return;

        let faction = this.game().factions[ unit.faction ];
        _.moveItemById( unit.id, faction.data.units, this.data.webs );
    }


    /**
     * return which factions you currently have at least one unit trapped in webs
     *
     * @returns {[]}
     */
    factionsInWebs(){
        let totals = _.webbedTotals( this, this.game().data.factions );
        let factions = [];

        _.forEach( totals.factions, ( total, faction ) => {
            if( total ) factions.push( faction );
        });

        return factions;
    }


    /**
     * Format a string of area names from an array of area names
     *
     * @param areas
     * @returns {string}
     */
    areaString( areas ){
        if( areas.length === 1 ) return areas[0];

        let areasClone = areas.slice();
        let string = '';
        string = ` and ${areasClone.pop()}`;
        string = areasClone.join( ', ' ) + string;

        return string;
    }


    /**
     * Free a unit from our webs
     *
     * @param unit
     * @param faction
     */
    freeUnit( unit, faction ){
        _.moveItemById( unit.id, this.data.webs, faction.data.units );
        faction.returnUnitToReserves( unit );
    }


    /**
     * Allow other players to free their units from our webs
     */
    async freeUnitsFromWebs(){
        this.game().message({ message : `Units try to escape their webs` });

        let factions = this.factionsInWebs();
        if( !factions.length ) return this.game().message({ message : 'No units caught in webs', class : 'warning' });

        try {
            // ask each player if they want to free any units in webs
            let promises = [];
            for( let factionName of factions ) {
                promises.push( this.factionFreeFromWebs( this.game().factions[factionName] ) );
            }

            // wait for all players to finish
            await Promise.all( promises );

        } catch( error ){
            console.error( error );
        }
    }


    /**
     * Allow a faction to choose to free units from webs
     *
     * @param faction
     */
    factionFreeFromWebs( faction ){
        let player, data;

        return this.game().promise({ players: faction.playerId, name: 'free-units', data : {} })
            .then( ([player, data]) => this.handleFreeFromWebsResponse( player, data, faction ) );
    }


    /**
     * Handle the response from our free from webs prompt
     *
     * @param player
     * @param data
     * @param faction
     */
    async handleFreeFromWebsResponse( player, data, faction ){
        let areas = data.areas;

        // if that player didn't choose an areas, clear their prompt and return
        if( ! areas.length ) {
            this.game().message({ faction : faction, message : `units remain trapped in webs` });
            player.setPrompt({ active : false, updatePlayerData : true });
            return;
        }

        // otherwise resolve freeing the units from webs
        this.resolveFreeFromWebs( faction, areas, player );
    }


    /**
     * Resolve freeing a factions units from webs
     *
     * @param faction
     * @param areas
     * @param player
     */
    async resolveFreeFromWebs( faction, areas, player ){

        // pay energy equal to the number of areas chosen
        faction.payCost( areas.length, true );

        // clone our web object, then free the appropriate units
        let clonedWebs = this.data.webs.slice();
        clonedWebs.forEach( unit => {
            if( unit.faction === faction.name && areas.includes( unit.location ) ) this.freeUnit( unit, faction );
        });

        // alert the other players
        let areaString = this.areaString( areas );
        this.game().message({ faction : faction, message : `frees their units in the ${areaString}` });
        player.setPrompt({ active : false, updatePlayerData : true });
    }


    /**
     * Can we activate our drop token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateDrop( token, area ) {
        return this.hasSpiders() || area.canBattle();
    }


    /**
     * Do we have any spiders in our reserves to place?
     * @returns {boolean}
     */
    hasSpiders(){
        return this.data.units.some( unit =>  _.unitInReserves( unit, { type : 'spider' } ) );
    }


    /**
     * Deploy patsies directly into battle if XchXch is present
     *
     * @param battle
     */
    async deployXchxchAmbushUnits( battle ){
        let data, player;

        // is Xchxch here? No? then return
        if( !this.championInArea( battle.area.name ) ) return;

        // if we have no spiders, abort
        if( !this.hasSpiders() ){
            this.message( 'No spiders in reserves to place', { class : 'warning' });
            return;
        }

        // poop out spiders
        await this.resolveSpawnSpiders( battle.area, this.data.xchxchDeploy, `XchXch summons her brood to battle` );
    }




    /**
     * Place a spider unit in the given area
     *
     * @param area
     * @returns {object}
     */
    placeSpider( area ){
        let spider = this.data.units.find( unit => _.unitInReserves( unit, { type : 'spider' } ) );

        if( !spider ) return null;

        spider.location = area.name;
        return spider;
    }


    /**
     * Resolve our Drop token
     *
     * @param args
     */
    async activateDropToken( args ) {
        // poop out spiders
        let units = await this.resolveSpawnSpiders( args.area, this.data.dropDeploy, `Spiders drop from above in The ${args.area.name}` );

        // if we have no spiders to place, log the error
        if( !units.length ) this.message( 'No more spiders in reserves to place', { class : 'warning' });

        // if we placed no spiders, and can't battle, remove this token
        if( !units.length && ! args.area.canBattle() ) return this.game().declineToken( this.playerId, args.token, true );

        // start a battle here
        await this.game().battle( args.area );

        // move along home
        this.game().advancePlayer();
    }


    /**
     * Spawn spiders in an area
     * @param area
     * @param count
     * @param message
     * @returns {Unit[]}
     */
    async resolveSpawnSpiders( area, count, message ){
        let units = [];

        // add spiders equal to our dropDeploy count
        for( let i = 0; i < count; i++ ){
            let spider = this.placeSpider( area );
            if( !spider ) continue;
            units.push( spider );
        }

        // abort if we didn't deploy any units
        if( !units.length ) return [];

        // send out the birth announcements
        this.game().sound( 'hatch' );
        this.message( message );

        await this.game().timedPrompt('units-shifted', {
            message : message,
            units: units
        }).catch( error => console.error( error ) );

        return units;
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
            type: 'deadly',
            text: `spiders and champions are deadly, deadly units attack all enemies can't be modified`
        });

        return mods;
    }

}


module.exports = Spiders;
