let Faction = require( './Faction' );


class Loyalists extends Faction {
    name = 'loyalists';


    constructor( owner, game ) {
        super( owner, game );

        //data
        this.data.name = this.name;
        this.data.title = "Her Majesty's Loyalists";
        this.data.knightCount = 2; // how many knights to create with our knight token
        this.data.maxEnergy = 8;
        this.data.focusDescription = "Control specific areas";

        this.data.flipableUnits = ['patsy', 'goon', 'mole', 'talent'];

        // tokens
        this.tokens['knight'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'knight',
                cost: 0,
                resource : 1,
                req : "This token must be discarded if you can't knight any un-knighted units here"
            }
        };




        // units
        this.shouldSetUnitBaseStats = {
            basic : true,
            props : ['influence']
        };

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
                onMove: 'placeServants',
                onDeploy: 'placeServants',
                onUnitKilled: 'queenDeath'
            }
        };
    }


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ) {
        // for each upgrade add an extra knight to our base of two
        this.data.knightCount = 2 + upgrade;
    }


    /**
     * Handle place servants triggered event with the queen enters an area
     *
     * @param event
     */
    placeServants( event ){
        this.data.units.forEach( unit => {
            // all of our non-killed servants move into the queen's area
           if( unit.type === 'servant' && !unit.killed ) unit.location = event.unit.location;
        });
    }


    /**
     * Handle our queen death event trigger
     *
     * @param event
     */
    async queenDeath( event ){

        // announce the queen's death and grab the deetz
        let [ killer, potentialTypes, potentialAreas ] = this.initiateQueenDeath( event );

        // if there are no units to replace, we are done here
        if( !potentialTypes.length ){
            this.message( "The Queenslayers have no valid units to replace", { class : 'warning' });
            return;
        }

        // allow the killer to choose a unit to replace
        let [player, response] = await this.game().promise({
            players: killer.playerId,
            name: 'choose-units',
            data : {
                count : 1,
                areas : potentialAreas,
                belongsTo : this.name,
                unitTypes : potentialTypes,
                message: 'Choose a loyalist unit to replace'
            }
        });

        let unit = this.game().objectMap[ response.units[0] ];
        let message = `Replaces <span class="faction-loyalists">The Loyalist ${unit.name}</span> in the ${unit.location}`;
        this.game().message({ faction : killer, message: message });

        await killer.replaceUnit( unit, { message : `The ${killer.name} replace a unit in The ${unit.location}` } );
    }


    /**
     * Begin the mourning process, and identify the killer, the units they may replace,
     * and the areas they may do the replacing in
     *
     * @param event
     * @returns {[*, *|string[], *]}
     */
    initiateQueenDeath( event ) {

        let killer = this.game().factions[ event.unit.killed ]; //  who killed the queen

        // announce th death of the queen, long live the queen!
        this.game().sound( 'queendeath' );
        this.game().message({ faction : killer, message: `Have <span class="highlight">committed regicide</span>! The Queenslayers must now collect their bounty` });

        let killerOptions = killer.unitTypesInReserves( true ); // what unit types are in the killer's reserves?
        let victimOptions = this.unitTypesInPlay( true ); // what unit types
        let potentialTypes = _.intersection( killerOptions, victimOptions );
        let potentialAreas = this.areasWithUnits({ types : potentialTypes });

        return [ killer, potentialTypes, potentialAreas ];
    }


    /**
     * Can we activate our knight token
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateKnight( token, area ) {
        // do we have any knightable units in this area?
        return !! this.data.units.find( unit => this.knightable( unit, area ) );
    }


    /**
     * is the given unit knightable?
     *
     * @param unit
     * @param area
     * @returns {boolean}
     */
    knightable( unit, area ){
        if( typeof area !== 'string' ) area = area.name;
        return ! unit.flipped
               && unit.location === area
               && unit.basic;
    }


    /**
     * Handle our knight token activation
     *
     * @param args
     */
    async activateKnightToken( args ) {
        // creat an array of IDs for all of the knightable units in this area
        let knightableUnitIds = this.data.units.filter( unit => this.knightable( unit, args.area ) )
                                                .map( unit => unit.id );

        // choose which units to knight
        let unitsToKnight = await this.chooseUnitsToKnight( knightableUnitIds, args );

        // resolve knighting ceremony
        await this.resolveKnightUnits( unitsToKnight, args );

        // advance the game
        this.game().advancePlayer();
    }


    /**
     * Choose which units to knight
     *
     * @param knightableUnitIds
     * @param args
     */
    async chooseUnitsToKnight( knightableUnitIds, args ){
        // if we can knight all the units we have here then just return them all,
        // no need to choose. Just grab the appropriate objects from our map
        if( knightableUnitIds.length <= this.data.knightCount ){
            return knightableUnitIds.map( unitId => this.game().objectMap[unitId] );
        }

        let response = await this.prompt('choose-units', {
            count : this.data.knightCount,
            areas : [args.area.name],
            unitList: knightableUnitIds,
            playerOnly : true,
            message: "Choose units to knight"
        });

        // return the selected unit objects
        return response.units.map( unitId => this.game().objectMap[unitId] );
    }


    /**
     * Handle knighting units
     *
     * @param unitsToKnight
     * @param args
     */
    async resolveKnightUnits( unitsToKnight, args ){

        // knight each unit
        unitsToKnight.forEach( unit => this.knightUnit( unit ) );

        // create a string of knighted unit names
        let unitNames = unitsToKnight.map( unit => unit.name ).join(', ');

        let message = `Knights <span class="highlight">${ unitNames }</span> in the ${args.area.name}`;
        this.message( message );

        await this.game().timedPrompt('units-shifted', {
            message : `The Loyalists knight units in The ${args.area.name}`,
            units: unitsToKnight
        }).catch( error => console.error( error ) );
    }


    /**
     * Flip a face up unit to its knighted side
     *
     * @param unit
     */
    knightUnit( unit ) {
        unit.flipped = true;
        unit.firstStrike = true;
        unit.influence = unit.baseInfluence + 1;
    }


    /**
     * Return our knighted units to normal
     *
     * @param unit
     */
    unflipUnit( unit ) {
        unit.flipped = false;
        unit.firstStrike = false;
        unit.influence = unit.baseInfluence;
    }


    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods(mods, area) {

        // queen death
        if (this.data.units.find(unit => _.unitInArea(unit, area, { type : 'champion' } ))) {
            mods.push({
                type: 'queenDeath',
                text: `If Her Majesty dies, her killer may replace any loyalist unit in play with a matching one from their reserves`
            });
        }

        return mods;
    }


}


module.exports = Loyalists;
