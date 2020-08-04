let Faction = require( './Faction' );


class Society extends Faction {
    name = 'society';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Blackstone Society";
        this.data.maxEnergy = 10;
        this.data.tokensNotDiscarded = 0;
        this.data.tokensNotDiscardedMax = 0;

        // tokens
        this.tokens['hypnosis'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'hypnosis',
                cost: 1,
            }
        };

        // tokens
        this.tokens['word-of-command'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'word-of-command',
                cost: 0,
            }
        };

        // tokens
        this.tokens['push'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'push',
                cost: 0,
            }
        };

        // units
        this.units['patsy'].count = 5;
        this.units['talent'].count = 2;
        this.units['talent'].data.noDeploy = true;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Xavier Blackstone",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [4],
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                token: null,
                onKilled: 'clearXavierToken'
            }
        };
    }


    processUpgrade( n ) {
        switch( n ) {
            case 1 : this.data.tokensNotDiscardedMax = 0; break;
            case 2 : this.data.tokensNotDiscardedMax = 11; break;
        }
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
        this.data.tokensNotDiscarded = 0;
        let xavier = this.getXavier();
        if( xavier && xavier.token ){
            xavier.token.location = 'xavier';
        }
    }


    startOfTurnPrompt() {
        return 'deploy-xavier';
    }

    async resolveStartOfTurn( player, area ){

        console.log( 'Society start of turn resolve' );

        let xavier = this.data.units.find( unit => unit.type === 'champion' );

        let data = {
            cost : 0,
            units : [xavier.id],
            toArea : area
        };

        await this.processDeploy( player, data );

        player.setPrompt({ name : 'choose-target' });
        this.game().data.playerAction++;
        Server.saveToDB( this );
        this.game().updateAll();
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
        return this.potentialHypnosisTypes( area ).length && this.money() >= 1;
    }

    canActivateWordOfCommand( token, area ) {
        return !this.hasUsedSkill( area );
    }

    async pushToken( args ) {

        await this.moveAwayToken( args, {
            fromArea: args.area.name,
            toAreas: args.area.data.adjacent,
            enemyOnly : true,
            basicOnly : true,
            limit : 1,
            message : 'Choose a unit to push'
        });
        this.game().sound( 'huh' );
        this.game().advancePlayer();
    }


    async wordOfCommandToken( args ) {
        await this.useSkill( args.area );
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
                            message: "Choose a unit to hypnotize" }
                });

        if( data.decline ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        let unit = this.game().objectMap[ data.units[0] ];
        let message = `Replaces <span class="faction-${unit.faction}">The ${unit.faction} ${unit.name}</span> in the ${unit.location}`;
        this.game().message({ faction : this, message: message });
        this.game().sound( 'hypnotize' );
        this.replaceUnit( unit );

        this.game().advancePlayer();
    }

}




module.exports = Society;
