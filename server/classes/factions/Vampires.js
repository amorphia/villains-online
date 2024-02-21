let Faction = require( './Faction' );


class Vampires extends Faction {
    name = 'vampires';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onAfterTokenReveal" : "handleBatMove"
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Czarkovian Aristocrats";
        this.data.focusDescription = "Kill units in many different areas";
        this.data.batMove = 1; // how many bats we can move when revealing a token

        this.data.unitPropAttackBonus = { vampire : 0 };

        // icons
        this.data.statusIcon = 'vampires';
        this.data.statusDescription = 'has vampire units';

        this.data.flipableUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];

        // tokens
        this.tokens['feast'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'feast',
                cost: 0,
                description: "In each area where you have one or more revealed DEPLOY tokens, make an attack with one of your units",
                req : "This token must be discarded if you can't make at least one attack"
            }
        };

        // units
        this.shouldSetUnitBaseStats = {
            basic : true,
            props : ['attack']
        };

        this.units['goon'].data.onHit = 'becomeVampire';
        this.units['goon'].data.vampire = false;

        this.units['talent'].data.onHit = 'becomeVampire';
        this.units['talent'].data.vampire = false;
        this.units['talent'].data.attack = [5];

        this.units['mole'].data.onHit = 'becomeVampire';
        this.units['mole'].data.vampire = false;
        this.units['mole'].data.attack = [7];

        this.units['patsy'].count = 6;
        this.units['patsy'].data.onHit = 'becomeVampire';
        this.units['patsy'].data.vampire = false;
        this.units['patsy'].data.attack = [7];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Lilith",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [4,4],
                cost: 2,
                vampire: true,
                killed: false,
                toughness: true,
                flipped: false,
                selected: false,
                hitsAssigned: 0,
            }
        };
    }




    /**
     * Process our upgrades
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ) {
        this.data.unitPropAttackBonus.vampire = upgrade;
    }


    /**
     * Triggered event for after a token is revealed.
     * Allows player to make a batmove after revealing one of their tokens
     *
     * @param token
     */
    async handleBatMove( token ){
        // if we didn't reveal the token, abort
        if( token.faction !== this.name ) return;

        let destinationAreaName = token.location;

        // check for areas with vampires (that aren't this area), if we have none, abort
        let potentialAreas = this.areasWithUnits({ hasProp : "vampire", excludesArea : destinationAreaName });
        if( !potentialAreas.length ) return;

        // get our bats to move
        let units = await this.chooseBatsToMove( potentialAreas, destinationAreaName );
        if( !units.length ) return;

        // message and log the move
        this.game().sound( 'bats' );
        this.message( `Fly ${units.length} vampire${units.length > 1 ? 's':'' } to The ${destinationAreaName}` );
        await this.game().timedPrompt('units-shifted', {
            message : `${units.length === 1 ? 'A Vampire flies' : 'Vampires fly'} to The ${destinationAreaName}`,
            units: units
        });
    }


    /**
     * Allow the player to choose which bats to move, and them process those move
     *
     * @param potentialAreas
     * @param areaName
     * @returns {array}
     */
    async chooseBatsToMove( potentialAreas, areaName ){
        let units = [];

        // show player prompt
        let message = this.data.batMove > 1 ? `Fly up to ${this.data.batMove} vampires to the ${areaName}` : `Fly a vampire to the ${areaName}?`;

        let response = await this.prompt('choose-units', {
                count : this.data.batMove,
                areas : potentialAreas,
                playerOnly : true,
                hasProp : 'vampire',
                canDecline : true,
                optionalMax : true,
                message: message
        });

        if( response.decline ) return [];

        // map our unit references
        units = response.units.map( unitId => this.game().objectMap[ unitId ] );

        // move the selected units
        units.forEach( unit => {
            this.placeUnit( unit, areaName );
        });

        return units;
    }


    /**
     * Can we activate our feast token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateFeast( token, area ) {
        return this.feastAreas().length > 0;
    }


    /**
     * Return an array of the areas we can feast in
     *
     * @returns {array}
     */
    feastAreas(){
        let areas = {};

        // grab our revealed deploy tokens in play
        let feastTokens = this.data.tokens.filter( token => token.type === 'deploy'
                                                            && token.location
                                                            && token.revealed );

        feastTokens.forEach( token => {
            // get the token's area
            let area = this.game().areas[token.location];

            // if we have everything we need then add this area name to our areas object
            if( this.hasUnitsInArea( area )
                && this.hasEnemyUnitsInArea( area )
                && !area.hasCard( 'cease-fire' )
            ) areas[area.name] = true;
        });

        return Object.keys( areas );
    }


    /**
     * Resolve a feast token
     *
     * @param args
     */
    async activateFeastToken( args ) {
        let areas = this.feastAreas();
        let output = [];

        // feast in each of our feast areas
        for( let area of areas ){
           output.push( await this.resolveFeastAttack( area ) );
        }

        this.message(`Has finished feasting` );

        // filter empty values from output array
        output = output.filter( item => item );

        // show results to each player
        if( output.length ){
            await this.game().timedPrompt('noncombat-attack', { output : output } )
                .catch( error => console.error( error ) );
        }

        this.game().advancePlayer();
    }


    /**
     * Resolve a feast attack
     *
     * @param areaName
     * @return
     */
    async resolveFeastAttack( areaName ){
        let data, player;

        this.message(`Feasts in The ${ areaName }` );

        // prompt player to select a unit
        let response = await this.prompt( 'choose-units', {
            count : 1,
            areas : [areaName],
            hasAttack: true,
            playerOnly : true,
            showEnemyUnits: true,
            message: "Choose a unit to attack"
        });

        // grab our unit from the object map
        let unit = this.game().objectMap[ response.units[0] ];

        // resolve attack with that unit
        return await this.attack({
            area : this.game().areas[ unit.location ],
            attacks : unit.attack,
            unit : unit,
            noDecline : true
        });
    }


    /**
     * Become vampire triggered event
     *
     * @param event
     */
    becomeVampire( event ) {
        let unit = event.unit;
        if( unit.flipped || unit.killed ) return;

        unit.flipped = true;
        unit.vampire = true;

        // improve attacks by 2
        // unit.attack = unit.baseAttack.map( attack => attack - 2 );
        let message = `<span class="faction-vampires">${unit.name}</span> becomes a vampire in The ${unit.location}`;
        this.message(message );

    }

    /**
     * Unflip a unit
     *
     * @param unit
     */
    unflipUnit( unit ) {
        unit.flipped = false;
        if( unit.type === 'champion' ) return;

        unit.vampire = false;
        unit.combatTempProp = 'vampire';
        // if( unit.baseAttack ) unit.attack = [...unit.baseAttack];
    }


    /**
     * Get a list of our faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {
        mods.push({
            type: 'becomeVampire',
            text: `Face up units that roll a hit become vampires, improving their attacks`
        });

        if( this.data.unitPropAttackBonus.vampire ){
            mods.push({
                type: 'vampireUpgrade',
                text: `Vampires gain +${this.data.unitPropAttackBonus.vampire} to their attacks`,
            });
        }

        return mods;
    }

}


module.exports = Vampires;
