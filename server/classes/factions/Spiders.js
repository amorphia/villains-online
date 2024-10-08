let Faction = require( './Faction' );


class Spiders extends Faction {
    name = 'spiders';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            //"onSetup" : "setupDropTokens",
            "onBeforeBattle" : "xchxchAmbushUnits"
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Eyes of the Woods";
        this.data.focusDescription = "Kill units belonging to many different players";
        this.data.dropDeploy = 1; // how many spider do we place with our Drop token?
        this.data.xchxchDeploy = 1; // how many spiders do we place at the start of combat with xchxch?

        // tokens

        // used to store additional web tokens before the appropriate upgrade is scored
        this.data.drops = [];

        this.tokens['drop'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'drop',
                cost: 0,
                resource : 1,
                description: "Place a spider in this area from your reserves, then start a battle here if able",
                req : "To avoid discarding this token you must place a spider, or start a battle"
            }
        };

        /*
        this.tokens['web'] = {
            count: 3,
            data: {
                influence: 1,
                type: 'web',
                cost: 0,
                resource : 1,
                req : "To avoid discarding this token you must be able to web at least one enemy basic unit"
            }
        };
        */

        // units
        this.units['goon'].count = 4;
        this.units['mole'].count = 4;
        this.units['patsy'].count = 6;
        this.units['patsy'].data.attack = [8];

        this.units['spider'] = {
            count: 10,
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
                influence: 1,
                attack: [],
                //deadly: true,
                flipped: false,
                toughness: true,
                //firstStrike: true,
                cost: 1,
                killed: false,
                onDeploy: 'deployXchxchWeb',
                //onMove: 'deployXchxchWeb',
                selected: false,
                hitsAssigned: 0,
            }
        };
    }

    /**
     * Sort this faction to the front of combat order
     *
     * @param combatFactions
     */
    battleOrderSort( combatFactions ) {
        combatFactions.sort( (a, b) => {
            if ( a.name === this.name ) return -1;
            if ( b.name === this.name ) return 1;
            return a.order - b.order
        });
    }

    /**
     * Remove the vines tokens we haven't unlocked yet from our reserves
     */

    /*
    setupDropTokens(){
        this.setupVariableItems({
            value: 'drop',
            cache: this.data.drops,
            reserves: this.data.tokens,
        });
    }
    */

    /**
     * Process faction upgrade
     */

    processUpgrade( upgrade ) {
        this.data.dropDeploy = 1 + upgrade;

        /*
        this.upgradeVariableItems({
            cache: this.data.drops,
            reserves: this.data.tokens,
        });
        */
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
     * @param event
     */
    async deployXchxchWeb( event ){
        let area = this.game().areas[ event.unit.location ];

        if( !this.hasEnemyUnitsInArea( area, { basic : true } ) ){
            this.message( "No units for XchXch to web", { class : 'warning' } );
            return;
        }

        let units = await this.chooseWebUnits( area );

        units.forEach( unit => {
            unit.webbed = true;
            if( unit.ready ) unit.ready = false;
        });
    }

    /**
     * Deploy patsies directly into battle if XchXch is present
     *
     * @param battle
     */
    async xchxchAmbushUnits( battle ){

        // is Xchxch here? No? then return
        if( !this.championInArea( battle.area.name ) ) return;

        // if we have no spiders, abort
        if( !this.hasSpiders() ) return this.message( 'No spiders in reserves to place', { class : 'warning' });

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

        this.placeUnit( spider, area.name );
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
     * Select which enemy units to trap in webs
     *
     * @param area
     * @returns {Array}
     */
    async chooseWebUnits( area ){

        let factions = _.factionsWithUnitsInArea( this.game().factions, area, {
            exclude : this.name,
            basic : true });

        let response = await this.prompt('choose-units', {
            count : factions.length,
            areas : [area.name],
            basicOnly : true,
            enemyOnly : true,
            differentPlayers : true,
            message: "Choose one basic unit from each enemy player to web"
        });

        // return the selected unit objects
        return response.units.map( unitId => this.game().objectMap[unitId] );
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

        mods.push({
            type: 'fastAttack',
            text: `attacks first in combat`
        });

        return mods;
    }

}


module.exports = Spiders;
