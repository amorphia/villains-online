let Faction = require( './Faction' );


class Bureau extends Faction {
    name = 'bureau';

    constructor(owner, game) {
        super(owner, game);

        // triggered events
        this.triggers = {
            "onCleanUp" : "resetUsedSkips",
            "onAfterActivateToken" : "eraseThePast",
            'onSetup' : 'setUpVariousBits',
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Bureau of Eternity";
        this.data.focusDescription = "Have the most tokens in many areas";
        this.data.deployCache = [];
        this.data.cardCache = [];
        //this.data.bonusDeploy = { type: 'champion', count : 1 };

        // track our skips used
        this.data.skips = {
            max : 0,
            used : 0,
        };

        // tokens
        this.tokens['deploy'].count = 5;
        this.tokens['card'].count = 5;
        this.tokens['move'].count = 2;
        this.tokens['battle'].count = 2;

        this.tokens['loop'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'loop',
                cost: 0,
                //resource: 1,
                description: "Once this token has been activated, you may replace it with a (face down) token from your reserves as an action.",
                req : "Passive token: this token may always be activated"
            }
        };

        this.units['goon'].count = 4;
        this.units['mole'].count = 4;

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

    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        // add additional tokens to our reserves
        this.upgradeVariableItems({
            reserves: this.data.tokens,
            cache: this.data.cardCache,
        });

        this.upgradeVariableItems({
            reserves: this.data.tokens,
            cache: this.data.deployCache,
        });

        this.sortTokens();
    }

    sortTokens(){
        const order = ['deploy', 'card', 'move', 'battle', 'loop'];
        this.data.tokens.sort((a, b) => {
            const aIndex = order.indexOf(a.type);
            const bIndex = order.indexOf(b.type);
            if( aIndex === bIndex ) return 0;
            return aIndex < bIndex ? -1 : 1;
        });
    }

    /**
     * Resolve our skip action
     *
     * @param player
     */
    takeSkipAction( player ){
        // track our skips
        this.data.skips.used++;
        let remainingSkips = this.data.skips.max - this.data.skips.used;
        this.message( `skip their turn <span class="highlight">(${remainingSkips} skips remaining)</span>` );

        // advance the game
        this.game().advancePlayer();
    }


    /**
     * Handle our erase the past token triggered ability
     *
     * @param token
     */
    async eraseThePast( token ){
        let area = this.game().areas[token.location];
        if( token.faction !== this.name || !area ) return;

        // get the token to try and bounce
        let enemyToken = this.getFirstMatchingEnemyToken( area, token );
        if( !enemyToken ) return;

        // resolve erasing the past
        await this.resolveEraseThePast( enemyToken, area ).catch( error => console.log( error ) );
    }


    /**
     * Return the first rev
     *
     * @param area
     * @param ourToken
     * @returns {Token|null}
     */
    getFirstMatchingEnemyToken( area, ourToken ){
        return area.data.tokens.find( token => token.faction !== this.name
            && token.revealed
            && token.name === ourToken.name );
    }


    /**
     * Resolve our erase the past ability
     *
     * @param token
     * @param area
     */
    async resolveEraseThePast( token, area ){
        let faction = this.game().factions[token.faction];
        this.message( `attempts to erase The ${token.faction} ${token.name} token from The ${area.name}` );


        // ask player if they want to pay 1 to prevent this
        let [player, response] = await this.game().promise({
            players: faction.playerId,
            name: 'prevent-erase',
            data: {
                token : token,
            }
        }).catch( error => console.error( error ) );

        // if the player pays {1} abort
        if( response.pay ){
            faction.payCost( 1, true );
            this.game().message({ faction : faction, message: "Stops the past from being erased", class : 'highlight' });
            return;
        }

        // otherwise discard the token
        _.discardToken( token, area );
        this.message( `Erases the past in the ${area.name}` );
    }


    /**
     * Can we activate our loop token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateLoop( token, area ) {
        // sure man, go for it
        return true;
    }


    /**
     * Handle our initial activation of a loop token
     */
    activateLoopToken() {
        // nothing to see here
        this.game().advancePlayer();
    }


    /**
     * Take a loop action by removing a loop token
     *
     * @param player
     * @param areaName
     */
    async takeLoopAction( player, areaName ){

        // show popup
        this.game().popup( this.playerId, { type: 'loop', area : areaName, faction : this.name });

        // get our loop token
        let loopToken = this.data.tokens.find( token => token.type === 'loop' );

        // get our replacement token
        let replacementToken = await this.getLoopTokenReplacementToken( loopToken );

        // swap the two tokens
        await this.resolveLoopAction( loopToken, replacementToken )
            .catch( error => console.error( error ) );

        // advance the game
        this.game().advancePlayer();
    }


    /**
     * Allow our player to choose a replacement token for our loop
     *
     * @param loopToken
     * @returns {Token}
     */
    async getLoopTokenReplacementToken( loopToken ){

        // prompt player to choose a token
        let response = await this.prompt('loop-action', { token : loopToken } )
            .catch( error => console.error( error ) );

        return this.game().objectMap[response.token.id];
    }


    /**
     *
     * @param loopToken
     * @param replacementToken
     */
    async resolveLoopAction( loopToken, replacementToken ){
        let area = this.game().areas[loopToken.location];

        this.message( `Exploits a time loops in The ${loopToken.location}` );

        // prepare our replacement token
        replacementToken.revealed = false;
        delete replacementToken.selected;
        replacementToken.location = loopToken.location;

        // prepare our loop token
        let loopTokenIndex = _.findIndex( area.data.tokens, token => token.id === loopToken.id );
        loopToken.location = null;
        loopToken.revealed = false;
        delete loopToken.selected;

        // swap our tokens
        area.data.tokens[loopTokenIndex] = replacementToken;
    }


    /**
     * Reset our used skips at the end of each turn
     */
    resetUsedSkips(){
        this.data.skips.used = 0;
    }


    setUpVariousBits(){
        this.setupDeployAndCardTokens();
    }

    /**
     * Remove the vines tokens we haven't unlocked yet from our reserves
     */
    setupDeployAndCardTokens(){
        this.setupVariableItems({
            value: 'deploy',
            reserves: this.data.tokens,
            cache: this.data.deployCache,
        });

        this.setupVariableItems({
            value: 'card',
            reserves: this.data.tokens,
            cache: this.data.cardCache,
        });
    }
}


module.exports = Bureau;
