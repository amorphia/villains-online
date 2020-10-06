let Faction = require( './Faction' );


class Aliens extends Faction {
    name = 'aliens';

    constructor( owner, game ) {
        super( owner, game );

        //data
        this.data.name = this.name;
        this.data.title = "The Centari Invasion";
        this.data.kau = null;
        this.data.farMove = false;
        this.data.focusDescription = "Capture many enemy markers";

        this.capturedRewards = [
            { ap : 1, maxEnergy : 1 },
            { ap : 1, cardDraw : 1 },
            { ap : 1, maxEnergy : 1 },
            { ap : 1, cardDraw : 1 },
            { ap : 1 },
            { ap : 1, pp : 1 },
        ];

        this.data.captured.max = this.capturedRewards.length;

        // tokens
        this.tokens['invade'] = {
            count : 1,
            data : {
                influence: 1,
                type : 'deploy',
                noLimit : true,
                cost : 0
            }
        };
        this.tokens['deploy'].count = 1;
        this.tokens['move'].count = 2;

        // units
        this.units['goon'].count = 3;
        this.units['mole'].count = 8;
        this.units['patsy'].count = 2;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Kau the Omnipotent",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [1],
                cost: 1,
                killed : false,
                selected : false,
                hitsAssigned : 0
            }
        };
    }

    factionCombatMods( mods, area ) {
        if( this.data.units.find( unit => _.unitInArea( unit, area, { type: 'champion' } ) ) ){
            mods.push( { type : 'kauImmunity', text : `Negates enemy defense bonuses that come from cards` });
        }

        return mods;
    }

    processUpgrade( n ){
        switch( n ){
            case 2 :
                this.data.tokens.forEach( token => token.cost = 0 );
                break;
            case 1 :
                this.data.tokens.forEach( token => token.cost = 1 );
                break;
        }
    }

    cardsToDraw(){
        let cardCount = super.cardsToDraw();
        if( this.data.captured.current >= 4 ) cardCount++;
        return cardCount;
    }

    async invadeToken( args ){
        args.deployLimit = 17;

        let output = await this.deploy( args );

        if( output && output.declined ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.game().advancePlayer();
    }

    onSetup(){
        this.data.kau = _.find( this.data.units, unit => unit.type === 'champion' );
    }
}

module.exports = Aliens;
