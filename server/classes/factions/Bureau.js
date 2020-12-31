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
        this.data.bonusDeploy = { type: 'champion', count : 1 };

        this.data.skips = {
            max : 0,
            used : 0,
        };


        // tokens
        this.tokens['deploy'].count = 4;
        this.tokens['card'].count = 4;
        this.tokens['move'].count = 2;
        this.tokens['battle'].count = 2;

        this.tokens['loop'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'loop',
                cost: 0,
            }
        };


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Observer",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [],
                cost: 0,
                hidden : true,
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };
    }


    processUpgrade( n ) {
        this.data.skips.max = n === 1 ? 1 : 3;
    }


    async onAfterActivateToken( token ){
        let player, data, area = this.game().areas[token.location];
        if( token.faction !== this.name || !area ) return;

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
        delete newToken.selected;
        newToken.location = area.name;

        let loopIndex = _.findIndex( area.data.tokens, item => item.id === loop.id );
        loop.location = null;
        loop.revealed = false;
        delete loop.selected;

        area.data.tokens[loopIndex] = newToken;
        this.game().message({ faction : this, message: `Exploits a time loops in The ${area.name}` });
    }


    loopToken() {
        this.game().advancePlayer();
    }

    factionCleanUp(){
        this.data.skips.used = 0;
    }
}


module.exports = Bureau;
