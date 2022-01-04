let Faction = require( './Faction' );


class Skeletons extends Faction {
    name = 'skeletons';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onCleanup" : "resetSkeletonUnits"
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Restless Dead";
        this.data.focusDescription = "Have units of specific types in enemy areas";
        this.data.optionalAttack = true; // this faction doesn't need to attack with its units
        this.data.endOfTurnRevive = 0; // how many skeletons to revive at the end of the turn

        // icons
        this.data.statusIcon = 'skeleton';
        this.data.statusDescription = 'has skeleton units';
        this.data.flipableUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];

        // tokens
        this.tokens['card'].count = 3;
        this.tokens['deploy'].count = 2;

        this.tokens['lich'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'lich',
                cost: 0,
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

        this.units['talent'].data.onDamaged = 'checkBecomeSkeleton';
        this.units['talent'].data.flipped = false;
        this.units['talent'].data.skeleton = false;


        this.units['patsy'].count = 2;
        this.units['patsy'].data.onDamaged = 'checkBecomeSkeleton';
        this.units['patsy'].data.flipped = false;
        this.units['patsy'].data.skeleton = false;


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Xer'Zhul",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [6,6,6],
                cost: 2,
                flipped: false,
                killed: false,
                selected: false,
                skeleton: false,
                skilled: true,
                ready: false,
                hitsAssigned: 0,
                onDamaged : 'checkBecomeSkeleton',
                onSkill : 'xerZhulRaiseDead',
                //onDeploy : 'xerZhulEnters',
                //onMove : 'xerZhulEnters'
            }
        };
    }




    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ) {
        this.data.endOfTurnRevive = upgrade * 2;
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
        return this.canActivateDeploy( token, area ) || this.canActivateCard( token, area );
    }


    /**
     * Handle activating our lich token
     *
     * @param args
     */
    async activateLichToken( args ) {

        args.fromToken = true;

        // resolve deploy
        let deployOutput = await this.deploy({
            deployLimit : 1,
            ...args
        });

        // resolve card
        let cardOutput = await this.playACard( args );

        // check if we did either of these things
        if( cardOutput && cardOutput.declined && deployOutput && deployOutput.declined ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.game().advancePlayer();
    }


    /**
     * Handle flipping units from face up to face down and vice versa
     *
     * @param options
     */
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

    /**
     * Resolve flipping units
     *
     * @param response
     */
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
            unit.influence = 0;
            unit.skeleton = true;
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


    /**
     * Allow Xer'Zhul to raise the dead when he uses a skill ability
     *
     * @param event
     */
    async xerZhulRaiseDead( event ){

        let units = await this.reviveUnits({
            reviveCount : 1,
            reviveEvent: 'reviveAsSkeletons'
        });

    }


    /**
     * Revive our units ask skeletons when using xerZhul's revive ability
     * @param units
     * @param args
     * @returns {*}
     */
    reviveAsSkeletons( units, args ){

        units.forEach( unit => {
            this.becomeSkeleton( unit )
        });

        return units;
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
        if( !this.data.endOfTurnRevive ) return;

        await this.flipUnits({
            count : this.data.endOfTurnRevive,
            flippedOnly : true
        })
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
