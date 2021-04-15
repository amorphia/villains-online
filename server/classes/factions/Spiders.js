let Faction = require( './Faction' );


class Spiders extends Faction {
    name = 'spiders';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onFactionKillsUnit" : "webKilledUnit",
            "onStartOfTurn" : "freeUnitsFromWebs",
            "onBeforeBattle" : "deployXchxchAmbushUnits"
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Eyes of the Woods";
        this.data.focusDescription = "Trap enemy units in webs";
        this.data.xchxchDeploy = 1; // how many patsies do we deploy at the start of combat with xchxch?
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
                req : "To avoid discarding this token you must deploy at least one patsy, or start a battle"
            }
        };

        // units
        this.units['goon'].count = 3;
        this.units['mole'].count = 3;
        this.units['patsy'].count = 10;
        this.units['patsy'].data.deadly = true;
        this.units['patsy'].data.attack = [8];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Xchxch",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [4],
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
        this.data.xchxchDeploy = upgrade + 1;
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
        // do we have any unkilled patsies?
        let hasPatsies = this.data.units.some( unit => unit.type === 'patsy' && !unit.killed );
        // or can we battle?
        let canBattle = area.canBattle();
        return hasPatsies || canBattle;
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

        let options = {
            area: battle.area,
            faction: this,
            player: this.playerId,
            fromToken : true,
            deployLimit: this.data.xchxchDeploy,
            unitTypes: ['patsy'],
        };

        this.message( `Xchxch calls her brood to the feast` );

        // resolve deploy
        await this.deploy( options );
    }


    /**
     * Resolve our Drop token
     *
     * @param args
     */
    async activateDropToken( args ) {

        // deploy up to two patsies here
        let options = {
            area: args.area,
            faction: this,
            player: this.playerId,
            fromToken : true,
            deployLimit: 2,
            unitTypes: ['patsy'],
        };
        let deployed = await this.deploy( options );

        // if we deployed no units, and can't battle, remove this token
        if( ( !deployed.units || !deployed.units.length ) && ! args.area.canBattle() ) return this.game().declineToken( this.playerId, args.token, true );

        // start a battle here
        await this.game().battle( args.area );

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
            type: 'deadly',
            text: `Patsies and champions are deadly, deadly units attack all enemies can't be modified`
        });

        return mods;
    }

}


module.exports = Spiders;
