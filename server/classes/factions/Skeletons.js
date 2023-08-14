let Faction = require( './Faction' );


class Skeletons extends Faction {
    name = 'skeletons';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            //"onCleanUp" : "resetRaiseAreas",
            "onSetup" : "setupPatsies",
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Restless Dead";
        this.data.focusDescription = "Have units of specific types in enemy areas";
        //this.data.optionalAttack = true; // this faction doesn't need to attack with its units
        //this.data.endOfTurnRevive = 0; // how many skeletons to revive at the end of the turn
        this.data.patsyCache = [];

        // icons
        this.data.statusIcon = 'skeleton';
        this.data.statusDescription = 'has skeleton units';
        this.data.flipableUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];
        this.data.raiseAreas = [];

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

        //this.units['goon'].count = 5;
        this.units['goon'].data.toughness = true;
        this.units['goon'].data.flipped = false;
        this.units['goon'].data.onWounded = 'becomeSkeleton';

        //this.units['mole'].count = 5;
        this.units['mole'].data.toughness = true;
        this.units['mole'].data.flipped = false;
        this.units['mole'].data.onWounded = 'becomeSkeleton';

        //this.units['talent'].count = 3;
        this.units['talent'].data.toughness = true;
        this.units['talent'].data.flipped = false;
        this.units['talent'].data.onWounded = 'becomeSkeleton';


        this.units['patsy'].count = 6;
        this.units['patsy'].data.toughness = true;
        this.units['patsy'].data.flipped = false;
        this.units['patsy'].data.onWounded = 'becomeSkeleton';


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Xer'Zhul",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [5],
                cost: 0,
                flipped: false,
                killed: false,
                selected: false,
                skeleton: false,
                hitsAssigned: 0,
                toughness: true,
                seeking: true,
                onDeploy: 'xerZhulActions',
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
        const areasWithSkeletons = this.areasWithUnits({ basic: true, flipped: true });

        const areas = {};

        Object.values( this.game().factions ).forEach( faction => {
            const options = { killed : true, basic: true };
            options.typeIn = unitTypesInReserves;

            faction.data.units.forEach( unit => {
                if( !_.isValidUnit( unit, options ) ) return;

                if( !areas[unit.location] ){
                    areas[unit.location] = new Set();
                }

                areas[unit.location].add( unit.type );
            })
        });

        areasWithSkeletons.forEach(area => delete areas[area]);
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
            let {availableActions, raiseableUnits, raiseableAreas} = this.populateLichActions( args.token, args.area, actionsTaken );

            if( availableActions.length === 0 ){
                done = true;
                continue;
            }

            // choose action type
            let response = await this.prompt( 'choose-lich-option',  {
                actions: availableActions,
                unitTypes: Array.from(raiseableUnits),
            });

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
                let unitRaised = await this.raiseUnit(raiseableAreas);

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

        if( !actionsTaken.includes( 'raise' ) && Object.keys( deadWeCanRaise ).length ){
            actions.push( 'raise' );
        }

        if( actionsTaken.filter( action => action === 'card' ).length < this.data.cardLimit && this.canActivateCard( token, area ) ){
            actions.push( 'card' );
        }

        let raiseableUnitTypes = new Set();
        Object.values(deadWeCanRaise).forEach(set => set.forEach(val => raiseableUnitTypes.add(val)));

        return {
            availableActions : actions,
            raiseableUnits : raiseableUnitTypes,
            raiseableAreas : Object.keys(deadWeCanRaise),
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
     * Flip a unit to their skeleton side
     *
     * @param unit
     */
    becomeSkeleton( unit ) {
        unit.killed = null;
        unit.flipped = true;
        unit.skeleton = true;
        unit.influence = 0;
        unit.cannotBeReady = true;
        if( unit.skilled ) unit.skilled = false;
        if( unit.ready ) unit.ready = false;
    }


    /**
     * Revert a skeleton to its face up side
     *
     * @param unit
     */
    unflipUnit( unit ) {
        unit.flipped = false;
        unit.skeleton = false;
        unit.cannotBeReady = false;
        unit.influence = unit.baseInfluence;
        if ( unit.baseSkilled ) unit.skilled = true;
    }

    async raiseUnit( areas, count = 1, type = null){

       // let filteredAreas = areas.filter(area => !this.data.raiseAreas.includes(area));

        if( !areas.length ){
            this.message( "No dead to raise", { class : 'warning' } );
            return;
        }

        const reserveTypes = this.unitTypesInReserves();

        let response = await this.prompt( 'choose-units', {
            count: count,
            areas: areas,
            killedOnly: true,
            basicOnly: true,
            optionalMax: true,
            raiseDeadTargets: reserveTypes,
            canDecline: true,
            differentAreas: true,
            message: count > 1 ? "Choose units to raise as skeletons" : "Choose a unit to raise as a skeleton",
        });

        return await this.resolveRaiseUnit( response );
    }

    async resolveRaiseUnit( response ){
        if( !response?.units?.length ){
            return false;
        }

        let units = [];

        //let raiseAreas = this.data.raiseAreas;

        response.units.forEach( responseUnit => {
            let chosenUnit = this.game().objectMap[ responseUnit ];
            let area = chosenUnit.location;
            let unit = this.data.units.find( item => _.unitInReserves( item, { type: chosenUnit.type } ) );

            if( !unit ){
                this.message( "Could not raise this unit", { class : 'warning' } );
                return false;
            }

            unit.killed = null;
            if(!unit.skeleton){
                this.becomeSkeleton( unit );
            }

            unit.location = area;
            //raiseAreas.push(area);

            units.push(unit);
        });

        await this.game().timedPrompt('units-shifted', {
            message: `Skeletons were raised`,
            units: units
        });

        return true;
    }

    async xerZhulActions( event ){
        const toArea = event.unit.location;
        await this.xerZhulAttack( this.getChampion(), toArea );
    }

    async xerZhulAttack( unit, area ){
        // resolve attack with that unit
        let output = await this.attack({
            area : this.game().areas[area],
            attacks : unit.attack,
            unit : unit
        });

        await this.game().timedPrompt('noncombat-attack', { output : [output] } )
            .catch( error => console.error( error ) );

        if(!output.hasKill ) return;

        let units = [];
        let types = output.hasKill.map( unit => unit.type );

        types.forEach( type => {
            let skeleton = this.data.units.find( unit => !unit.location && unit.type === type );
            if(!skeleton) return;

            if(!skeleton.skeleton){
                this.becomeSkeleton( skeleton );
            }

            skeleton.location = area;
            units.push( skeleton );
        });

        await this.game().timedPrompt('units-shifted', {
            message: `Skeletons were raised`,
            units: units
        });
    }

    /**
     * Allow Xer'Zhul to raise the dead
     *
     * @param area
     */
    async xerZhulRaiseDead( area ){
        const areas = Object.keys( this.deadWeCanRaiseByArea() );

        if( !areas.includes( area ) ){
            this.message( "No dead for Xer'Zhul to raise", { class : 'warning' } );
            return;
        }

        await this.raiseUnit( [ area ] );
    }

    /*
    resetRaiseAreas(){
        this.data.raiseAreas = [];
    }
     */

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
