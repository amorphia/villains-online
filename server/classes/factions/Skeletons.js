let Faction = require( './Faction' );


class Skeletons extends Faction {
    name = 'skeletons';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onCleanUp" : "resetSkeletonUnits",
            "onSetup" : "setupPatsies",
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Restless Dead";
        this.data.focusDescription = "Have units of specific types in enemy areas";
        //this.data.optionalAttack = true; // this faction doesn't need to attack with its units
        this.data.endOfTurnRevive = 0; // how many skeletons to revive at the end of the turn
        this.data.patsyCache = [];

        // icons
        this.data.statusIcon = 'skeleton';
        this.data.statusDescription = 'has skeleton units';
        this.data.flipableUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];

        // tokens
        delete this.tokens['card'];
        this.tokens['battle'].count = 2;

        this.tokens['lich'] = {
            count: 3,
            data: {
                influence: 1,
                type: 'card',
                cost: 0,
                description: "Treat as a basic CARD token in every way except you may also raise a unit in this area (take these actions in any order)",
                req :  "This token must be discarded if you don't deploy any units or play any cards"
            }
        };

        // units
        this.shouldSetUnitBaseStats = {
            props : ['influence', 'skilled']
        };

        this.units['goon'].count = 4;
        this.units['goon'].data.onDamaged = 'checkBecomeSkeleton';
        this.units['goon'].data.flipped = false;
        this.units['goon'].data.skeleton = false;

        this.units['mole'].count = 4;
        this.units['mole'].data.onDamaged = 'checkBecomeSkeleton';
        this.units['mole'].data.flipped = false;
        this.units['mole'].data.skeleton = false;

        this.units['talent'].count = 3;
        this.units['talent'].data.onDamaged = 'checkBecomeSkeleton';
        this.units['talent'].data.flipped = false;
        this.units['talent'].data.skeleton = false;


        this.units['patsy'].count = 4;
        this.units['patsy'].data.onDamaged = 'checkBecomeSkeleton';
        this.units['patsy'].data.flipped = false;
        this.units['patsy'].data.skeleton = false;


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Xer'Zhul",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [],
                cost: 0,
                flipped: false,
                killed: false,
                selected: false,
                skeleton: false,
                skilled: true,
                ready: false,
                hitsAssigned: 0,
                onDamaged : 'checkBecomeSkeleton',
                onSkill : 'xerZhulRaiseDead',
            }
        };
    }


    setupPatsies(){
        this.setupVariableItems({
            value: 'patsy',
            cache: this.data.patsyCache,
            reserves: this.data.units,
            multiplier: 2,
        });
    }

    /**
     * Process faction upgrade
     */
    processUpgrade() {
        this.upgradeVariableItems({
            cache: this.data.patsyCache,
            reserves: this.data.units,
            multiplier: 2,
        });
    }


    /**
     * Can we activate our lich token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateLich( token, area ) {
        // can we activate a deploy token, or can we activate a card token?
        return this.deadWeCanRaiseByArea()[area.name] || this.canActivateCard( token, area );
    }


    deadWeCanRaiseByArea(){
        const unitTypesInReserves = this.unitTypesInReserves();
        const areas = {};

        console.log('unitTypesInReserves', unitTypesInReserves);

        Object.values( this.game().factions ).forEach( faction => {
            const options = { killed : true };

            if( faction.name !== this.name ){
                options.typeIn = unitTypesInReserves;
            }

            faction.data.units.forEach( unit => {
                if( _.isValidUnit( unit, options ) ){
                    if( !areas[unit.location] ){
                        areas[unit.location] = new Set();
                    }


                    areas[unit.location].add( unit.type );
                    console.log('areas[unit.location]', areas[unit.location]);
                }
            })
        });

        return areas;
    }


    /**
     * Handle activating our lich token
     *
     * @param args
     */
    async activateLichToken( args ) {

        args.fromToken = true;

        let actionsTaken = [];
        let done = false;

        while(done === false){
            let {availableActions, raiseableUnits} = this.populateLichActions( args.token, args.area, actionsTaken );

            if( availableActions.length === 0 ){
                done = true;
                continue;
            }

            // choose action type
            let response = await this.prompt( 'choose-lich-option',  {
                actions: availableActions,
                unitTypes: Array.from(raiseableUnits),
            });

            console.log( 'choose lich option response', response );

            // if we declined conclude the loop
            if( response.action === 'decline' ){
                done = true;
                continue;
            }

            // if we chose card play a card
            if( response.action === 'card' ){
                let cardOutput = await this.playACard( args );
                if( !cardOutput.declined ){
                    actionsTaken.push('card');
                }
            } else {
                let unitRaised = await this.raiseUnit([args.area.name]);
                if( unitRaised ){
                    actionsTaken.push('raise');
                }
            }
        }

        // check if we didn't take either option and if so, discard our token
        if( actionsTaken.length === 0 ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.game().advancePlayer();
    }


    populateLichActions( token, area, actionsTaken ){
        let actions = [];
        const deadWeCanRaise = this.deadWeCanRaiseByArea();

        if( !actionsTaken.includes( 'raise' ) && deadWeCanRaise[area.name] ){
            actions.push( 'raise' );
        }

        if( !actionsTaken.includes( 'card' ) && this.canActivateCard( token, area ) ){
            actions.push( 'card' );
        }

        return {
            availableActions : actions,
            raiseableUnits : deadWeCanRaise[area.name] ?? new Set()
        };
    }

    /**
     * Handle flipping units from face up to face down and vice versa
     *
     * @param options
     */
    /*
    async flipUnits( options = {} ){
        let areas;

        // set area(s) we are allowed to flip units in
        if( options.area ) areas = [options.area.name];
        else areas = this.areasWithUnits({ flipped : options.flippedOnly  });

        // init our choose data
        let chooseData = {
            optionalMax: true,
            areas : areas,
            playerOnly : true,
            canDecline : true
        };

        // set our choose units to flip message
        chooseData.message = options.flippedOnly ? "Choose units to flip face-up" : "Choose units to flip up or down";

        // set count
        if( options.count ){
            chooseData.count = options.count;
        } else {
            chooseData.count = 20;
            chooseData.hideMax = true;
        }

        if( options.flippedOnly ) chooseData.flippedOnly = true;

        // choose units to flip
        let response = await this.prompt( 'choose-units', chooseData );

        // no unit selected? Welp, guess we are done here
        if( !response.units ){
            this.message( 'Declines to flip units' );
            return;
        }

        // flip our units
        await this.resolveFlipUnits( response );

    }
    */

    /**
     * Resolve flipping units
     *
     * @param response
     */

    /*
    async resolveFlipUnits( response ){

        // convert IDs to unit objects
        let units = response.units.map( unitId => this.game().objectMap[unitId] );

        // then flip the selected units appropriately
        units.forEach( unit => {
            if( unit.flipped ) this.unflipUnit( unit );
            else this.becomeSkeleton( unit );
        });

        // announce what units were flipped
        await this.game().timedPrompt('units-shifted', {
            message : `Skeleton units flipped`,
            units: units
        });
    }
    */

    /**
     * Can this unit become a skeleton after being assigned hits?
     *
     * @param event
     * @returns {string}
     */
    checkBecomeSkeleton( event ){

        // event.hits is the number of hits assigned to this unit
        if( event.unit.flipped || event.hits > 1 ){
            return;
        }

        this.becomeSkeleton( event.unit );
        return `transforms ${event.unit.name} into a skeleton`;
    }


    /**
     * Flip a unit to their skeleton side
     *
     * @param unit
     */
    becomeSkeleton( unit ) {
        if( !unit.flipped && !unit.killed ) {
            unit.flipped = true;
            unit.skeleton = true;

            // XerZhul doesn't lose any stats
            if(unit.type === 'champion') return;

            unit.influence = 0;
            if( unit.skilled ) unit.skilled = false;
            if( unit.ready ) unit.ready = false;
        }
    }


    /**
     * Revert a skeleton to its face up side
     *
     * @param unit
     */
    unflipUnit( unit ) {
        unit.flipped = false;
        unit.skeleton = false;
        unit.influence = unit.baseInfluence;
        if ( unit.baseSkilled ) unit.skilled = true;
    }

    async raiseUnit( areas, count = 1){

        if( !areas.length ){
            this.message( "No dead to raise", { class : 'warning' } );
            return;
        }

        const reserveTypes = this.unitTypesInReserves();

        let response = await this.prompt( 'choose-units', {
            count: count,
            areas: areas,
            killedOnly: true,
            raiseDeadTargets: reserveTypes,
            canDecline: true,
            differentAreas: true,
            message: count > 1 ? "Choose units to raise as skeletons" : "Choose a unit to raise as a skeleton",
        });

        return await this.resolveRaiseUnit( response );
    }

    async resolveRaiseUnit( response ){
        if( response.units.length === 0 ){
            return false;
        }

        let units = [];

        response.units.forEach( responseUnit => {
            let chosenUnit = this.game().objectMap[ responseUnit ];
            let area = chosenUnit.location;
            let unit;

            if( chosenUnit.faction !== this.name ){
                unit = this.data.units.find( item => _.unitInReserves( item, { type: chosenUnit.type } ) );
            } else {
                unit = chosenUnit;
            }

            if( !unit ){
                this.message( "Could not raise this unit", { class : 'warning' } );
                return false;
            }

            unit.killed = null;
            if(!unit.skeleton){
                this.becomeSkeleton( unit );
            }

            unit.location = area;

            units.push(unit);
        });


        await this.game().timedPrompt('units-shifted', {
            message: `Skeletons were raised`,
            units: units
        });

        return true;
    }


    /**
     * Allow Xer'Zhul to raise the dead when he uses a skill ability
     *
     * @param event
     */
    async xerZhulRaiseDead( event ){
        const areas = Object.keys( this.deadWeCanRaiseByArea() );

        if( !areas.length ){
            this.message( "No dead for Xer'Zhul to raise", { class : 'warning' } );
            return;
        }
        await this.raiseUnit( areas, 2 );
    }


    /**
     * Returns a list of areas that are adjacent to the given area, and where we have tokens
     *
     * @param toArea
     * @returns {[]}

    getTokenMoveAreas( toArea ){
        let areas = [];

        Object.values( this.game().data.areas ).forEach( area => {
            if( toArea.data.adjacent.includes( area.name )
                && area.tokens.find( token => token.faction === this.name ) ) areas.push( area.name );
        });

        return areas;
    }


    /**
     * Handle XerZhuls enter an area trigger, allowing the player to drag a token to his new area
     *
     * @param event

    async xerZhulEnters( event ){
        let unit = event.unit;
        let area = this.game().areas[unit.location];

        // get adjacent areas with valid tokens to move
        let areasWithValidTokens = this.getTokenMoveAreas( area );
        // if we don't have any valid tokens to move abort
        if( ! areasWithValidTokens.length ) return this.message("No valid tokens for Xer'Zhul to move" );

        // player optionally chooses a token to move
        let response = await this.prompt( 'choose-tokens', {
            count : 1,
            areas : areasWithValidTokens,
            optional : true,
            playerOnly : true,
            message : `Have Xer'Zhul move a token to the ${area.name}?`
        });

        // if we didn't choose a token, abort
        if( !response.tokens ) return this.message( `Declines to move a token to the ${area.name}` );

        // resolve our token drag
        this.resolveTokenMove( response, area );
      }


    /**
     * Resolve moving a token from XerZhul entering an area
     *
     * @param response
     * @param area
    resolveTokenMove( response, area ){
        // move token
        let token = this.game().objectMap[ response.tokens[0] ] ;

        // remove from old area
        let fromArea = this.game().areas[token.location];
        _.discardToken( token, fromArea );

        //move to new area
        token.location = area.name;
        area.data.tokens.push( token );
        this.message( `Xer'Zhul moves a token from The ${fromArea.name} to the ${area.name}` );
    }


    /**
     * Handle our end of turn revival trigger
     */
    async resetSkeletonUnits() {
        if( !this.data.endOfTurnRevive ) {
            console.log( 'no end of turn unflip' );
            return;
        }

        console.log( 'attempting unflip' );

        await this.flipUnits({
            count : this.data.endOfTurnRevive,
            flippedOnly : true
        });
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
            type: 'becomeSkeleton',
            text: `Face up units assigned a hit become skeletons, rather than being killed`
        });
        return mods;
    }


}


module.exports = Skeletons;
