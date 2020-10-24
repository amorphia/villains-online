let Faction = require( './Faction' );


class Bureau extends Faction {
    name = 'bureau';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Bureau of Eternity";
        this.data.focus = 'most-tokens-focus';
        this.data.focusDescription = "Have the most tokens in many areas";
        this.data.reverseFlippedPip = true;

        this.data.deployLimit = 1;
        this.data.skips = {
            max : 0,
            used : 0,
        };



        // tokens
        this.tokens['deploy'].count = 4;
        this.tokens['card'].count = 4;
        this.tokens['move'].count = 1;
        this.tokens['battle'].count = 1;

        this.tokens['loop'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'loop',
                cost: 0,
            }
        };


        // units
        // unit count: 15

        this.units['goon'].count = 4;
        this.units['goon'].data.charged = true;
        //this.units['goon'].data.influence = 2;


        this.units['mole'].count = 4;
        this.units['mole'].data.charged = true;
        //this.units['mole'].data.influence = 3;


        this.units['talent'].data.charged = true;
        //this.units['talent'].data.influence = 2;


        this.units['patsy'].count = 3;
        //this.units['patsy'].data.influence = 1;


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Minister",
                type: 'champion',
                basic: false,
                influence: 3,
                attack: [3],
                firstStrike: true,
                charged : true,
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };
    }

    factionCombatMods( mods, area ) {

        if ( this.data.units.find( unit => _.unitInArea( unit, area, { flipped : true } ) ) ) {
            mods.push({
                type: 'chargedFirstStrike',
                text: `Charged units return during cleanup if killed`
            });
        }

        return mods;
    }


    processUpgrade( n ) {
        this.data.skips.max = n === 1 ? 1 : 3;
    }


    async onAfterActivateToken( token ){
        let player, data, area = this.game().areas[token.location];
        if( token.faction !== this.name ) return;

        let enemyToken = area.data.tokens.find( obj => obj.faction !== this.name && obj.revealed && obj.name === token.name );
        if( !enemyToken ) return;

        let enemyFaction = this.game().factions[enemyToken.faction];
        this.game().message({ faction : this, message: `attempts to erase The ${enemyToken.faction} ${enemyToken.name} token from The ${area.name}` });

        // ask player if they want to pay 1 to prevent this
        [player, data] = await this.game().promise({
            players: enemyFaction.playerId,
            name: 'prevent-erase',
            data: {
                token : enemyToken,
            }
        }).catch( error => console.error( error ) );

        if( data.pay ){
            enemyFaction.payCost( 1, true );
            return this.game().message({ faction : enemyFaction, message: "Stops the past from being erased", class : 'highlight' });
        }

        _.discardToken( enemyToken, area );
        this.game().message({ faction : this, message: `Erases the past in the ${area.name}` });
    }

    canActivateLoop( token, area ) {
        return true;
    }

    async loopAction( area ){
        let player, data, loop = this.data.tokens.find( token => token.type === 'loop' );

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'loop-action',
            data: { token : loop }
        }).catch( error => console.error( error ) );

        let newToken = this.game().objectMap[data.token.id];
        newToken.revealed = false;
        newToken.location = area.name;

        let loopIndex = _.findIndex( area.data.tokens, item => item.id === loop.id );
        loop.location = null;
        loop.revealed = false;

        area.data.tokens[loopIndex] = newToken;
        this.game().message({ faction : this, message: `Exploits a time loops in The ${area.name}` });
    }


    loopToken() {
        this.game().advancePlayer();
    }

    factionCleanUp(){
        this.data.skips.used = 0;
        this.reviveChargedUnits();
    }

    reviveChargedUnits() {
        this.game().message({ faction: this, message: 'Units return from the past' });
        this.data.units.forEach( unit => {
            if( unit.killed && unit.charged ){
                unit.killed = null;
                if( !unit.flipped && unit.type !== 'champion' ) this.dechargeUnit( unit );
            }
        });
    }

    chargeUnit( unit ){
        unit.flipped = true;
        unit.charged = true;
        //unit.influence++;
    }

    dechargeUnit( unit ){
        unit.flipped = true;
        unit.charged = false;
        //unit.influence--;
    }

    unitUnflipped( unit ) {
        unit.flipped = false;
        //unit.influence++;
        unit.charged = true;
    }

}


module.exports = Bureau;
