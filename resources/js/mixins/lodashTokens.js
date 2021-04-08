let helpers = {

    /**
     * Returns a count of each type of token the given faction has revealed in the given area
     *
     * @param faction
     * @param area
     * @return {object} // formatted { typeOne : {number}, typeTwo : {number} }
     */
    getTokenCounts( faction, area ){
        if( area.data ) area = area.data; // format input
        let tokens = {};

        area.tokens.forEach( token => {
            // cycle through all of the tokens in an area for revealed token belonging to this faction
            if( token.faction === faction.name && token.revealed ){
                tokens[token.type] = tokens[token.type] ? tokens[token.type] + 1 : 1;
            }
        });

        return tokens;
    },


    /**
     * Returns the first token from an area filtered by our options
     *
     * @param area
     * @param options
     *      {string} enemy // if provided with a faction name, then only that faction's enemies' tokens will be returned
     *      {string} player // if provided with a faction name, then only that faction's tokens will be returned
     * @returns {*}
     */
    getFirstToken( area, options ){
        if( area.data ) area = area.data; // format input

        return this.find( area.tokens, token => {
            return ( !options.hasOwnProperty( 'revealed' ) || token?.revealed === options.revealed )
                && ( !options.enemy || token.faction !== options.enemy )
                && ( !options.player || token.faction === options.player );
        });
    },


    /**
     * Returns the first unrevealed token in a given area
     *
     * @param area
     * @param options
     * @returns {Token}
     */
    firstUnrevealedToken( area, options = {} ){
        if( area.data ) area = area.data; // format input

        options.revealed = false;
        return this.getFirstToken( area, options );
    },


    /**
     * Returns the first revealed token in a given area
     *
     * @param area
     * @param options
     * @returns {*}
     */
    firstRevealedToken( area, options = {} ){
        if( area.data ) area = area.data; // format data

        options.revealed = true;
        return this.getFirstToken( area, options );
    },


    /**
     * Discards the given token from its area token track and return it to its owner's reserves
     *
     * @param token
     * @param area
     * @returns {boolean|number}
     */
    discardToken( token, area ){
        if( area.data ) area = area.data; // format
        let tokenSpace = false;

        // set token location to null, returning it to its owner's reserves
        token.location = null;

        // cycle through this area's tokens until we find our token, then replace it with
        // an empty object, return the token spot number that this token was discarded from
        _.forEach( area.tokens, (item, index, collection ) => {
            if( item.id && token.id === item.id ){
                collection[index] = {};
                tokenSpace = index + 1;
            }
        });

        return tokenSpace;
    },


};



module.exports = helpers;
