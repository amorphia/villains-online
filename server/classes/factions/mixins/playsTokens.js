let obj = {

    /**
     * Reveal an action token
     *
     * @param player
     * @param token
     * @param area
     * @param wildType
     */
    async revealToken( player, token, area, wildType = null) {

        // if this is a resource token gain a resource
        if( token.resource ) this.gainResources( 1 );

        // reveal this token
        token.revealed = true;
        this.game().message({ message: 'reveal', type : 'reveal-token', faction : this, token : token });
        this.game().popup( player, { type : 'token', token : token, area : area.name, faction: this.name });

        // reveal wild token
        this.revealWildToken( wildType );

        // handle onAfterTokenReveal triggers
        await this.handleRevealTokenTriggers( token );

        // if we can't activate this token, pull it
        if( ! this.canActivate( token, area ) ){
            this.sound( 'error' );
            this.game().declineToken( player, token );
            return;
        }

        //pay token costs
        let cost = this.tokenCost( token, area, wildType );

        // ask the player if they want to activate or decline the token
        this.game().listen({ name : 'activate-decline', players : player, data : { token : token, cost : cost, wildType : wildType } });

        await this.game().pushGameDataToPlayers();
    },


    /**
     * Reveal a wild token, if applicable
     *
     * @param wildType
     */
    revealWildToken( wildType ){
        if( !wildType ) return;

        this.message(`have chosen to treat their <span class="faction-robots">wild</span> token as a <span class="capitalize highlight">${wildType}</span> token`);
        if( wildType === 'battle' ) this.gainResources( 1 );
    },


    /**
     * handle any handle onAfterTokenReveal triggers
     *
     * @param token
     */
    async handleRevealTokenTriggers( token ){
        try {
            for( let faction of Object.values( this.game().factions ) ){
                if( faction.triggers.onAfterTokenReveal ) await faction[faction.triggers.onAfterTokenReveal]( token );
            }
        } catch( error ){
            console.error( error );
        }
    },


    /**
     * Determine a token's cost
     *
     * @param token
     * @param area
     * @param wildType
     * @returns {number}
     */
    tokenCost( token, area = null, wildType = null ){
        if( !area ) area = this.game().areas[ token.location ];

        // apply our base attack
        let cost = token.cost;

        // if we are activating a wild token as a move, then add a cost of 2
        if( wildType === 'move' ) cost = 2;

        // apply credit freeze tax
        if( area.hasToken( 'credit-freeze' ) && this.name !== 'bankers' ) cost++;

        return cost;
    },


    /**
     * Can we activate a given token?
     *
     * @param token
     * @param area
     * @returns {*}
     */
    canActivate( token, area ){
        let tokenMethod = 'canActivate' + _.classCase( token.type );
        return this[tokenMethod]( token, area );
    },


    /**
     * Activate a token
     *
     * @param player
     * @param token
     * @param wildType
     */
    activateToken( player, token, wildType ){
        let area = this.game().areas[token.location];
        let cost = this.tokenCost( token );
        if( cost > 0 ) this.payCost( cost, true );

        this.message( `Activate their <span class="highlight">${token.name}</span> token` );

        let action = 'activate' + _.classCase( token.name ) + 'Token';
        this[action]({ player : player, token : token, area : area, wildType : wildType });
    },


    /**
     * Handle our onActivateToken triggers
     *
     * @param args
     * @returns {Promise<void>}
     */
    async handleAfterActivateTokenTriggers( args ){
        // if we are taking a pod activation, abort
        if( args.pod ) return;

        for( let faction of Object.values( this.game().factions ) ){
            if( faction.triggers.onAfterActivateToken ) await faction[faction.triggers.onAfterActivateToken]( args.token );
        }
    }
};


module.exports = obj;

