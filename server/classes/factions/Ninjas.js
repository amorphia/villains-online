let Faction = require( './Faction' );


class Ninjas extends Faction {
    name = 'ninjas';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onCleanUp" : "clearSmokeFromAreas",
            "onAfterTokenReveal" : "lotusDancerMove"
        };


        //data
        this.data.name = this.name;
        this.data.focusDescription = "Kill different unit types";
        this.data.title = "The Clan of the Pale Moon";
        this.data.bladesBonusDice = 0;
        this.data.smokeAreas = []; // areas with a smoke marker in them

        // icons
        this.data.statusIcon = 'smoke';
        this.data.statusDescription = 'can force an attacking enemy unit to miss';

        // tokens
        this.tokens['blades'] = {
            count: 2,
            data: {
                influence: 1,
                type: 'blades',
                resource: 1,
                cost: 0,
                req: "This token must be discarded if you can't make an attack with a unit"
            }
        };

        // units
        this.units['patsy'].data.attack = [7];
        this.units['patsy'].data.onHit = 'placeSmoke';
        this.units['talent'].data.attack = [5];
        this.units['talent'].data.onHit = 'placeSmoke';
        this.units['mole'].data.attack = [7];
        this.units['mole'].data.onHit = 'placeSmoke';
        this.units['goon'].data.onHit = 'placeSmoke';

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Lotus Dancer",
                type: 'champion',
                basic: false,
                influence: 2,
                seeking: true,
                attack: [4],
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onHit: 'placeSmoke',
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
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ) {
        this.data.bladesBonusDice = upgrade;
    }


    /**
     * Handle our lotus dancer move triggered ability to allow her to move into a battle token when revealed
     *
     * @param token
     */
    async lotusDancerMove( token ) {

        // if the token revealed wasn't a battle token, or lotus dancer isn't in play, then abort
        let lotusDancer = this.getChampionInPlay();
        if (token.type !== 'battle' || !lotusDancer) return;

        // get lotus dancer's area, and the token's area
        let lotusDancerArea = this.game().areas[lotusDancer.location];
        let area = this.game().areas[token.location];

        // check if lotus dancer can't legally move
        if (lotusDancerArea.isTrapped(this) // if she's trapped
            || !area.data.adjacent.includes(lotusDancer.location) // if she's not adjacent
            || area.hasKau() // if kau is in the destination
        ) return;

        // choose to dance or not
        this.message( 'Lotus dancer deciding whether to enter the frey' );
        await this.chooseToDance( lotusDancer, area );

    }


    /**
     * Allow player to choose to move lotus dancer
     *
     * @param lotusDancer
     * @param area
     */
    async chooseToDance( lotusDancer, area ){

        // prompt player to decide to move lotus dancer
        let response = await this.prompt( 'question', {
            message: `Move lotus dancer from the ${lotusDancer.location} to the ${area.name}?`
        });

        if ( !response.answer ) return this.message( 'Lotus dancer declines to get involved' );

        // resolve move
        await this.resolveLotusDancerMove( lotusDancer, area );
    }


    /**
     * Resolve the lotus dancer move
     *
     * @param lotusDancer
     * @param area
     */
    async resolveLotusDancerMove( lotusDancer, area ){
        // st lotus dancer's new area
        lotusDancer.location = area.name;

        // show results to all players
        this.game().sound('wiff');
        this.message( `Lotus Dancer slips into the ${area.name}` );

        await this.game().timedPrompt('units-shifted', {
            message: `Lotus Dancer slips into the ${area.name}`,
            units: lotusDancer
        }).catch(error => console.error(error));
    }


    /**
     * Can we activate our blades token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateBlades( token, area ) {
        // do we have a unit in this area, and can this are battle?
        return this.hasUnitsInArea( area ) && area.canBattle();
    }


    /**
     * Handle blades token activation
     *
     * @param args
     */
    async activateBladesToken( args ) {

        // get our attacking unit
        let unit = await this.chooseBladesUnit( args );

        // make an attack with that unit
        await this.resolveBladesAttack( unit );

        this.game().advancePlayer();
    }


    /**
     * Choose a unit to attack with our blades token
     *
     * @param args
     */
    async chooseBladesUnit( args ){
        // prompt player to select a unit
        let response = await this.prompt( 'choose-units', {
            count: 1,
            areas: [args.area.name],
            hasAttack: true,
            playerOnly: true,
            showEnemyUnits: true,
            message: "Choose a unit to make an attack",
        });

        return this.game().objectMap[response.units[0]];
    }


    /**
     * Resolve our blades attack
     *
     * @param unit
     */
    async resolveBladesAttack( unit ){
        // resolve attack with that unit
        let attackArea = this.game().areas[unit.location];
        let output = await this.attack({
            area: attackArea,
            attacks: unit.attack,
            unit: unit,
            noDecline: true,
            bonusDice: this.data.bladesBonusDice
        });

        if (output) {
            await this.game().timedPrompt('noncombat-attack', { output: [output] })
                .catch(error => console.error(error));
        }
    }


    /**
     * Handle our place smoke event to place a smoke token in this area
     *
     * @param event
     */
    placeSmoke( event ) {
        // if we already have a smoke token here, abort
        if( this.data.smokeAreas.includes( event.unit.location ) ) return;

        // add our smoke token
        this.data.smokeAreas.push( event.unit.location );
        this.message( `Release a smoke bomb in the ${event.unit.location}` );
    }


    /**
     * Clear the smoke tokens from all area
     */
    async clearSmokeFromAreas() {
        if( !this.data.smokeAreas.length ) return;

        this.data.smokeAreas = [];
        this.message( `smoke clears from the city` );
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
            type: 'ninjas',
            text: `The Ninjas attack first in player order, if one of their units rolls a hit place a smoke token in that area if it doesn't have one already.`
        });

        mods.push({
            type: 'smoke',
            text: `If the ninjas have a smoke token in this area, they may discard it to ignore one enemy unit's attack`
        });

        return mods;
    }

}


module.exports = Ninjas;
