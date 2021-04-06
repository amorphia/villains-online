let Faction = require( './Faction' );


class Society extends Faction {
    name = 'society';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
            "onCleanUp" : "setXavierTokenLocation"
        };

        //data
        this.data.name = this.name;
        this.data.focus = 'token-focus';
        this.data.focusDescription = "Tokens in many areas";
        this.data.title = "The Blackstone Society";

        // used to store additional word tokens before the appropriate upgrade is scored
        this.data.words = [];

        // tokens
        this.tokens['hypnosis'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'hypnosis',
                cost: 0,
                req : "This token must be discarded if you don't replace a unit"
            }
        };


        // tokens
        this.tokens['push'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'push',
                cost: 0,
                resource : 1,
                req : "This token must be discarded if you don't move a unit"
            }
        };


        // tokens
        this.tokens['word-of-command'] = {
            count: 3,
            data: {
                influence: 1,
                type: 'word-of-command',
                cost: 0,
                req : "This token must be discarded if you can't activate this area's skill ability"
            }
        };


        // units
        this.units['patsy'].count = 5;
        this.units['goon'].count = 6;
        this.units['mole'].count = 6;
        delete this.units['talent'];

        this.units['henchman'] = {
            count: 1,
            data: {
                name: "henchman",
                type: "henchman",
                basic: false,
                cost: 0,
                noDeploy: true,
                influence: 0,
                attack: [4],
                firstStrike: true,
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Xavier Blackstone",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [],
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                token: null,
                onUnitKilled: 'clearXavierToken',
                onMove: 'placeHenchman',
                onDeploy: 'placeHenchman',
            }
        };
    }


    /**
     * Process faction upgrade
     */
    processUpgrade() {
        this.upgradeVariableTokens( this.data.words );
    }


    /**
     * Place henchman when we deploy Xavier to an area
     *
     * @param event
     */
    placeHenchman( event ){
        let henchman = this.data.units.find( unit => unit.type === 'henchman' && !unit.killed );
        if( henchman ) henchman.location = event.unit.location;
    }


    /**
     * Clear Xavier's token (triggered when he's killed)
     *
     * @param event
     */
    clearXavierToken( event ){
        let xavier = this.getXavier();
        if( !xavier.token ) return;

        xavier.token.location = null;
        xavier.token = null;
    }


    /**
     * Reveal, and optionally activate the token on Xavier
     *
     * @param player
     */
    takeXavierAction( player ){
        let xavier = this.getXavier();
        let token = this.game().objectMap[ xavier.token.id ];
        let area = this.game().areas[ xavier.location ];

        // move this token to xavier's area
        token.location = area.name;
        area.data.tokens.push( token );

        // null xavier's token property
        xavier.token = null;

        this.message( "Reveals the token on Xavier Blackstone" );

        // resolve xavier's token
        this.game().takeTokenAction( player, token.id );
    }


    /**
     * Return xavier blackstone's unit object
     *
     * @returns {object}
     */
    getXavier(){
        return this.getChampion();
    }


    /**
     * Set the token placed on xavier back to having its location as "xavier" instead of null
     * which happens automatically during cleanup. This allows us to keep the token on xavier
     * at the end of the turn instead of returning it to our reserves
     */
    async setXavierTokenLocation(){
        let xavier = this.getXavier();
        if( xavier && xavier.token ){
            xavier.token.location = 'xavier';
        }
    }


    /**
     * Our start of turn prompt
     *
     * @returns {string}
     */
    startOfTurnPrompt() {
        return 'deploy-xavier';
    }


    /**
     * Resolve our Xavier deploy
     *
     * @param player
     * @param area
     */
    async resolveStartOfTurn( player, area ){
        let xavier = this.getChampion();

        let data = {
            cost : 0,
            units : [xavier.id],
            toArea : area,
            hidePrompt : true
        };

        // deploy Xavier
        await this.resolveDeploy( player, data );

        // set our new prompt
        player.setPrompt({ name : 'choose-target' });
        this.game().data.gameAction++;
        Server.saveToDB( this.game() );
        await this.game().pushGameDataToPlayers();
    }


    /**
     * Can we activate our push token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivatePush( token, area ) {
        // if there are basic enemy units in this area, then yes
        return this.hasEnemyUnitsInArea( area, { basic : true } );
    }


    /**
     * Handle activating our push token
     *
     * @param args
     */
    async activatePushToken( args ) {

        try {
            await this.moveAwayToken( args, {
                fromArea: args.area.name,
                toAreas: args.area.getDeployableAdjacentAreas(),
                enemyOnly : true,
                basicOnly : true,
                limit : 1,
                message : 'Choose a unit to push',
                promptMessage : 'The Society push a unit from The ' + args.area.name,
                sound : 'huh'
            });
        } catch( error ){
            console.error( error );
        }

        this.game().advancePlayer();
    }


    /**
     * Can we activate our Hypnosis token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateHypnosis( token, area ) {
        return this.potentialHypnosisTypes( area ).length > 0;
    }


    /**
     * Determines the potential types of units we can hypnotize in the given area
     *
     * @param area
     */
    potentialHypnosisTypes( area ){
        // the types we have in our reserves
        let reservesTypes = this.unitTypesInReserves( true );
        // the types our opponents have in this area
        let enemyTypes = this.enemyUnitTypesInArea( area, { basic : true } );
        // whatever types are on both arrays are hypnotizable
        return _.intersection( reservesTypes, enemyTypes );
    }


    /**
     * Handle our Hypnosis token
     *
     * @param args
     */
    async activateHypnosisToken( args ) {

        // choose a unit to hypnotize
        let response = await this.prompt( 'choose-units', {
            count : 1,
            areas : [args.area.name],
            basicOnly: true,
            unitTypes: this.potentialHypnosisTypes( args.area ),
            enemyOnly : true,
            payCost: true,
            canDecline : true,
            message: "Choose a unit to hypnotize"
        });

        // if we declined, then abort
        if( response.decline ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        // resolve our hypnosis replacement
        await this.resolveHypnosis( response );

        // advance game
        this.game().advancePlayer();
    }


    /**
     * Resolve a hypnotize replacement
     *
     * @param response
     */
    async resolveHypnosis( response ){

        // get our unit object, then pay its cost
        let unit = this.game().objectMap[ response.units[0] ];
        if( unit.cost > 0 ) this.payCost( unit.cost, true );

        // replace the unit and show results to all players
        let message = `Replaces <span class="faction-${unit.faction}">The ${unit.faction} ${unit.name}</span> in the ${unit.location}`;
        this.game().message( message );
        this.game().sound( 'hypnotize' );

        // resolve the replacement
        await this.replaceUnit( unit, { message : `The Society hypnotizes a unit in The ${unit.location}` } );
    }


    /**
     * Can we activate our Word of Command token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateWordOfCommand( token, area ) {
        return !this.hasUsedSkill( area );
    }


    /**
     * Handle our Word of Command Token
     *
     * @param args
     */
    async activateWordOfCommandToken( args ) {
        try {
            await this.useSkill( args.area );
        } catch( error ){
            console.error( error );
        }
        this.game().advancePlayer();
    }


    /**
     * On setup remove two of our word of command tokens from our reserves
     */
    onSetup(){
        this.setupVariableTokens( 'word-of-command', this.data.words );
    }
}




module.exports = Society;
