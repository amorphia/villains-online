let Faction = require( './Faction' );


class Society extends Faction {
    name = 'society';

    constructor( owner, game ) {
        super( owner, game );

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
                onKilled: 'clearXavierToken',
                onMove: 'placeHenchman',
                onDeploy: 'placeHenchman',
            }
        };
    }


    processUpgrade( upgrade ) {
        this.upgradeVariableTokens( upgrade, this.data.words );
    }


    placeHenchman( event ){
        let henchman = this.data.units.find( unit => unit.type === 'henchman' && !unit.killed );
        if( henchman ) henchman.location = event.unit.location;
    }


    clearXavierToken( event ){
        let xavier = this.getXavier();
        if( !xavier.token ) return;

        xavier.token.location = null;
        xavier.token = null;
    }


    revealXavierToken( player ){
        let xavier = this.getXavier();
        let token = this.game().objectMap[ xavier.token.id ];
        let area = this.game().areas[ xavier.location ];

        token.location = area.name;

        area.data.tokens.push( token );
        xavier.token = null;

        this.message({ message: "Reveals the token on Xavier Blackstone", faction : this });
        this.game().takeTokenAction( player, token.id );
    }


    getXavier(){
        return this.data.units.find( unit => unit.type === 'champion' );
    }


    factionCleanUp(){
        //this.data.tokensNotDiscarded = 0;
        let xavier = this.getXavier();
        if( xavier && xavier.token ){
            xavier.token.location = 'xavier';
        }
    }


    startOfTurnPrompt() {
        return 'deploy-xavier';
    }


    async resolveStartOfTurn( player, area ){
        let xavier = this.data.units.find( unit => unit.type === 'champion' );

        let data = {
            cost : 0,
            units : [xavier.id],
            toArea : area,
            hidePrompt : true
        };

        try {
            await this.processDeploy( player, data );
        } catch( error ){
            console.error( error );
        }

        player.setPrompt({ name : 'choose-target' });
        this.game().data.playerAction++;
        Server.saveToDB( this.game() );
        await this.game().updateAll();
    }


    canActivatePush( token, area ) {
        return this.hasEnemyUnitsInArea( area, { basic : true } );
    }


    potentialHypnosisTypes( area ){
        let reservesTypes = this.unitTypesInReserves( true );
        let enemyTypes = this.enemyUnitTypesInArea( area, { basic : true } );
        return _.intersection( reservesTypes, enemyTypes );
    }


    canActivateHypnosis( token, area ) {
        return this.potentialHypnosisTypes( area ).length;
    }


    canActivateWordOfCommand( token, area ) {
        return !this.hasUsedSkill( area );
    }


    async pushToken( args ) {

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


    async wordOfCommandToken( args ) {
        try {
            await this.useSkill( args.area );
        } catch( error ){
            console.error( error );
        }
        this.game().advancePlayer();
    }


    async hypnosisToken( args ) {
        let data, player;

        [player, data] = await this.game().promise({ players: this.playerId,
                    name: 'choose-units',
                    data : { count : 1,
                            areas : [args.area.name],
                            basicOnly: true,
                            unitTypes: this.potentialHypnosisTypes( args.area ),
                            enemyOnly : true,
                            payCost: true,
                            message: "Choose a unit to hypnotize" }
                }).catch( error => console.error( error ) );

        if( data.decline ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        let unit = this.game().objectMap[ data.units[0] ];
        if( unit.cost > 0 ) this.payCost( unit.cost, true );

        let message = `Replaces <span class="faction-${unit.faction}">The ${unit.faction} ${unit.name}</span> in the ${unit.location}`;
        this.game().message({ faction : this, message: message });
        this.game().sound( 'hypnotize' );
        await this.replaceUnit( unit, { message : `The Society hypnotizes a unit in The ${unit.location}` } );

        this.game().advancePlayer();
    }


    onSetup(){
        this.setupVariableTokens( 'word-of-command', this.data.words );
    }
}




module.exports = Society;
