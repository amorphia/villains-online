let obj = {

    /**
     * Setup variable tokens for factions that has a variable number of tokens that unlock along with their upgrades
     * (i.e. they start with 1 copy, then upgrade 1 unlocks a second, and upgrade 2 unlocks the third)
     *
     * @param tokenName
     * @param tokenCache
     */
    setupVariableTokens( tokenName, tokenCache ){
        // how many tokens should be in our cache?
        let numThatShouldBeInCache = 2 - this.data.upgrade;

        // if there are too few in the cache move some from our reserves to the cache
        if( tokenCache.length < numThatShouldBeInCache ){
            this.moveVariableTokensToCache( numThatShouldBeInCache, tokenName, tokenCache );
        }

        // if there are too many tokens in our cache move tokens from our cache to our reserves
        if( tokenCache.length > numThatShouldBeInCache ){
            this.moveVariableTokensToReserves( numThatShouldBeInCache, tokenCache );
        }
    },


    /**
     * Move variable tokens from our reserves to our cache
     *
     * @param numThatShouldBeInCache
     * @param tokenName
     * @param tokenCache
     */
    moveVariableTokensToCache( numThatShouldBeInCache, tokenName, tokenCache ){
        while( tokenCache.length < numThatShouldBeInCache ){
            let token = this.getVariableTokenFromReserves( tokenName );
            if( token ) _.moveItemById( token.id, this.data.tokens, tokenCache );
        }
    },


    /**
     * Get a matching variable token from our reserves that isn't in play or revealed
     *
     * @param tokenName
     * @returns {Token}
     */
    getVariableTokenFromReserves( tokenName ){
        return this.data.tokens.find( token => token.type === tokenName && !token.location && !token.revealed );
    },


    /**
     * Move variable tokens from our cache to our reserves
     *
     * @param numThatShouldBeInCache
     * @param tokenCache
     */
    moveVariableTokensToReserves( numThatShouldBeInCache, tokenCache ){
        while( tokenCache.length > numThatShouldBeInCache ) {
            this.data.tokens.push( tokenCache.pop() );
        }
    },


    /**
     * Upgrade a variable token by adding additional tokens to our reserves from our
     *  token cache until we reach our upgrade value
     *
     * @param tokenCache
     */
    upgradeVariableTokens( tokenCache ){
        // get the number of tokens to add
        let numThatShouldBeInCache = 2 - this.data.upgrade;
        this.moveVariableTokensToReserves( numThatShouldBeInCache, tokenCache );
    },

};

module.exports = obj;
