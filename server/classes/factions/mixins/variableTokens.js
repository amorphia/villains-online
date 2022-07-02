let obj = {

    /**
     * Setup variable tokens for factions that has a variable number of tokens that unlock along with their upgrades
     * (i.e. they start with 1 copy, then upgrade 1 unlocks a second, and upgrade 2 unlocks the third)
     *
     * @param args
     *      @prop cache
     *      @prop reserves
     *      @prop key
     *      @prop value
     *      @prop multiplier
     */
    setupVariableItems( args ){
        let multiplier = args.multiplier ?? 1;

        // how many tokens should be in our cache?
        args.numThatShouldBeInCache = (2 - this.data.upgrade) * multiplier;

        // if there are too few in the cache move some from our reserves to the cache
        if( args.cache.length < args.numThatShouldBeInCache ){
            this.moveVariableItemsToCache( args );
        }

        // if there are too many tokens in our cache move tokens from our cache to our reserves
        if( args.cache.length > args.numThatShouldBeInCache ){
            this.moveVariableItemsToReserves( args );
        }
    },


    /**
     * Move variable tokens from our reserves to our cache
     *
     * @param args
     */
    moveVariableItemsToCache( args ){
        while( args.cache.length < args.numThatShouldBeInCache ){
            let item = this.getVariableItemFromReserves( args );
            if( item ) _.moveItemById( item.id, args.reserves, args.cache );
        }
    },


    /**
     * Get a matching variable token from our reserves that isn't in play or revealed
     *
     * @param args
     * @returns object
     */
    getVariableItemFromReserves( args ){
        let key = args.key ?? 'type';
        return args.reserves.find( item => item[key] === args.value && !item.location && !item.revealed );
    },


    /**
     * Move variable tokens from our cache to our reserves
     *
     * @param args
     */
    moveVariableItemsToReserves( args ){
        while( args.cache.length > args.numThatShouldBeInCache ) {
            args.reserves.push( args.cache.pop() );
        }
    },


    /**
     * Upgrade a variable token by adding additional tokens to our reserves from our
     *  token cache until we reach our upgrade value
     *
     * @param args
     */
    upgradeVariableItems( args ){
        const multiplier = args.multiplier ?? 1;

        // get the number of tokens to add
        args.numThatShouldBeInCache = (2 - this.data.upgrade) * multiplier;
        this.moveVariableItemsToReserves( args );
    },



};

module.exports = obj;
