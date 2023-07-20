
class Faction {

    gameId; // game Id
    playerId; // player Id
    triggers = {}; // used to store faction game event triggers
    shouldSetUnitBaseStats = null; // do we need to save any unit base stats during setup?

    data = {
        owner : null, //the player who owns this faction
        rolls : [], // used to track our faction die rolls
        hits : {
            expected: 0,
            actual: 0,
        },
        areas: [],
        retainedAreas: [],

        // progress
        ap : 0, // area points
        pp : 0, // plan points
        upgrade : 0, // our current upgrade
        captured : {
            current : 0, // how many markers has this unit captured
            max : null // set by constructor
        },

        // core stats
        deployLimit : 2, // base deploy limit
        cardLimit: 1, // how many cards we can play with each CARD token
        planLimit : 3, // how many plans to draw up to each start phase
        cardDraw : 3, // how many action cards to draw at the start of each turn

        // money
        resources : 0, // how many resource cubes we have
        energy : 0, // our current energy
        maxEnergy : 9, // our maximum energy
        tokenCost : 1, // the cost to place an action token

        // combat
        attackBonus : 0, // bonus to apply to our unit's die rolls
        defenseBonus : 0, // penalty to apply to our enemies unit's die rolls
        bonusDice : 0, // how many extra dice our units throw when attacking
        unitTypeAttackBonus : [],

        // area stuff
        anyOrderPlans : false, // can we score our plans in any order? Set by the church
        capitolTokens : [], // stores which capitol tokens we have collected
        spyAll : false, // can we see all player's targets? Set by police
        tokenSpy : [], // which areas can we spy on tokens? Set by university
        skilledPatsies : false, // have our patsies gained the skilled ability? Set by the university
        usedSkills : [], // which area skills have we used this turn
        areasCapturedThisTurn : [], // which areas did we capture this turn

        // used to track our plans
        plans : {
            current : [],
            deck : [],
            completed : [],
        },


        units : [], // store our units
        tokens : [], // store our tokens

        // store our action cards
        cards : {
            hand : [],
            active : [],
            target : [],
        }
    };

    // the rewards we get for each enemy marker we capture
    capturedRewards = [
        { ap : 1, maxEnergy : 1 },
        { ap : 1, cardDraw : 1 },
        { ap : 1 },
        { ap : 2 },
    ];


    constructor( playerId, game ) {
        this.playerId = playerId;
        this.gameId = game.id;
        this.data.owner = playerId;
        this.data.captured.max = this.capturedRewards.length;
        this.tokens = _.cloneDeep( require( './mixins/baseTokens' ) );
        this.units = _.cloneDeep( require( './mixins/baseUnits' ) );

        // set dice rolls tracker values
        for( let i=1; i <= 10; i++ ){
            this.data.rolls[i] = 0;
        }

        // set godmode if applicable
        if( this.game().godMode && this.game().localServer ) this.godMode();

    }


    /**
     * Set God mode
     */
    godMode(){
        this.data.cardDraw = 10;
        this.data.planLimit = 8;
        this.data.maxEnergy = 30;
    }


    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @returns {*}
     */
    factionCombatMods( mods ){
        return mods
    }

    /**
     * Set a prompt for a player to respond to
     *
     * @param prompt
     * @param data
     * @returns {object} // the player's response
     */
    async prompt( prompt, data = {} ){
        let [player, response] = await this.game().promise({
            players: this.playerId,
            name: prompt,
            data: data
        }).catch( error => console.error( error ) );

        return response;
    }


    /**
     * Emit a sound
     *
     * @param sound
     * @param options
     */
    sound( sound, options ){
        this.game().sound( sound, options );
    }


    /**
     * Send a message to all players via the game log
     *
     * @param message
     * @param options
     */
    message( message, options = {} ){
        let args = {
            faction : this,
            message : message,
            ...options
        };

        this.game().message( args );
    }


    /**
     * Send a message to just this player's game log
     *
     * @param message
     */
    messagePlayer( message ){
        this.game().messagePlayer( this.playerId, message );
    }


    /**
     * draw plans up to our plan limit
     */
    drawPlans(){
        let toDraw = this.data.planLimit - this.data.plans.current.length;
        for( let i = 0; i < toDraw; i++ ){
            this.drawPlan();
        }
    }


    /**
     * Draw a plan card (if we have any left)
     */
    drawPlan(){
        let plan = this.data.plans.deck.shift();
        if( plan ) this.data.plans.current.push( plan );
    }


    /**
     * Handle unflipping a unit
     *
     * @param unit
     */
    unflipUnit( unit ){
        unit.flipped = false;
    }

    async placeUnit( unit, area, options = {} ){
        if( typeof area !== 'string') area = area.name;

        if( unit.flipped && (!unit.location || options.unflip ) ) this.unflipUnit( unit );

        unit.location = area;
        unit.killed = null;
        if( unit.ready ) unit.ready = false;
        if( unit.webbed ) delete unit.webbed;

        await this.unitTriggeredEvents( 'place', [ { unit: unit } ] );
    }

    /**
     * Gain Area Points and display the results
     *
     * @param number
     * @param options
     */
    gainAP( number = 1, options = {} ){
        this.data.ap += number;

        let message = number > 0 ? 'gain' : 'lose';
        message += ` xAP${ Math.abs( number ) }x`;

        this.message( message );
    }


    /**
     * Gain Plan Points and display the results
     *
     * @param number
     * @param options
     */
    gainPP( number = 1, options = {}  ){
        this.data.pp += number;

        let message = number > 0 ? 'gain' : 'lose';
        message += ` xPP${ Math.abs( number ) }x`;

        this.message( message );
    }

    /**
     * Return our current deploy limit
     *
     * @param args
     * @returns {number}
     */
    getDeployLimit( args ){
        return this.data.deployLimit;
    }

    /**
     * Return a unit to our reserves
     *
     * @param unit
     */
    returnUnitToReserves( unit ){
        // when calling this directly from an event we need to get the unit from the event data
        if( unit.unit ) unit = unit.unit;

        // remove from combat if needed
        if( this.game().combat ) this.game().combat.removeUnitFromCombat( unit );

        unit.killed = null;
        unit.location = null;
        if( unit.ready ) unit.ready = false;
        if( unit.webbed ) delete unit.webbed;
        if( unit.flipped ) this.unflipUnit( unit );
        if( unit.token ){
            unit.token.location = null;
            unit.token = null;
        }
    }

}


/**
 *
 *  Mixins
 *
 */
Object.assign( Faction.prototype, require( "./mixins/setup" ) );
Object.assign( Faction.prototype, require( "./mixins/valueMethods" ) );
Object.assign( Faction.prototype, require( "./mixins/playsTokens" ) );
Object.assign( Faction.prototype, require( "./mixins/deploysUnits" ) );
Object.assign( Faction.prototype, require( "./mixins/revivesUnits" ) );
Object.assign( Faction.prototype, require( "./mixins/playsCards" ) );
Object.assign( Faction.prototype, require( "./mixins/movesUnits" ) );
Object.assign( Faction.prototype, require( "./mixins/attacksWithUnits" ) );
Object.assign( Faction.prototype, require( "./mixins/makesNonCombatAttacks" ) );
Object.assign( Faction.prototype, require( "./mixins/unitTriggeredEvents" ) );
Object.assign( Faction.prototype, require( "./mixins/activatesSkills" ) );
Object.assign( Faction.prototype, require( "./mixins/variableTokens" ) );
Object.assign( Faction.prototype, require( "./mixins/handlePlans" ) );
Object.assign( Faction.prototype, require( "./mixins/controlsAreas" ) );
Object.assign( Faction.prototype, require( "./mixins/factionCleanup" ) );
Object.assign( Faction.prototype, require( "./mixins/replacesUnits" ) );
Object.assign( Faction.prototype, require( "./mixins/collectsUpgrades" ) );
Object.assign( Faction.prototype, require( "./mixins/hasMoney" ) );

module.exports = Faction;
