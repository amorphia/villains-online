let helpers = {

    /**
     * Returns a count of each type of token the given faction has revealed in the given area
     *
     * @param faction
     * @param area
     * @return {object} // formatted { typeOne : {number}, typeTwo : {number} }
     */
    getTokenCounts( faction, area ){
        if( !area ) return false;

        if( area.data ) area = area.data; // format input
        let tokens = {};

        area.tokens.forEach( token => {
            // cycle through all of the tokens in an area for revealed token belonging to this faction
            if( token.faction === faction.name && token.revealed ){
                tokens[token.type] = tokens[token.type] + 1 || 1;
            }
        });

        return tokens;
    },


    /**
     * Return the number of area the given faction has the most tokens in
     *
     * @param faction
     * @param areas
     * @returns {number}
     */
    factionAreasWithMostTokens( faction, areas ){
        if( faction.data ) faction = faction.data;
        let mostTokens = 0;

        // cycle through each faction
        Object.values( areas ).forEach( area => {
            let tokensInArea = {};

            // make a list of how many tokens this faction in each area
            area.tokens.forEach( token => {
                if( token.faction ) tokensInArea[token.faction] = tokensInArea[token.faction] + 1 || 1;
            });

            // compare this list of tokens per area to our list of most by area, if this faction has more than
            // the existing entry (if any) it takes the top spot
            if( this.maxSingleObject( tokensInArea ) === faction.name ) mostTokens++;
        });

        return mostTokens;
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
        if( !area ) return false;

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
        if( !area ) return false;

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
        if( !area ) return false;

        if( area.data ) area = area.data; // format data

        options.revealed = true;
        return this.getFirstToken( area, options );
    },


    /**
     * Discards the given token from its area token track and return it to its owner's reserves
     *
     * @param token
     * @param area
     * @param replacementToken
     * @returns {boolean|number}
     */
    discardToken( token, area, replacementToken = null ){
        if( !area ) return false;

        if( area.data ) area = area.data; // format
        let tokenSpace = false;

        // set token location to null, returning it to its owner's reserves
        token.location = null;

        // cycle through this area's tokens until we find our token, then replace it with
        // an empty object, return the token spot number that this token was discarded from
        _.forEach( area.tokens, (item, index, collection ) => {
            if( item.id && token.id === item.id ){
                if(replacementToken){
                    replacementToken.location = area.name;
                } else {
                    replacementToken = {};
                }

                collection[index] = replacementToken;
                tokenSpace = index + 1;
            }
        });

        return tokenSpace;
    },


};



module.exports = helpers;
