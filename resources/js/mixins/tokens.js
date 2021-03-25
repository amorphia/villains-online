let helpers = {

    getTokenCounts( faction, area ){
        let tokens = {};
        area.tokens.forEach( token => {
            if( token.faction === faction.name && token.revealed ){
                tokens[token.type] = tokens[token.type] ? tokens[token.type] + 1 : 1;
            }
        });
        return tokens;
    },

    firstUnrevealedToken( area, options = {} ){
        if( area.data ) area = area.data;
        return this.find( area.tokens, token => {
            return token && token.revealed === false && ( !options.enemy || token.faction !== options.enemy );
        });
    },

    firstRevealedToken( area, options = {} ){
        if( area.data ) area = area.data;

        return this.find( area.tokens, token => {
            return token && token.revealed
                && ( !options.enemy || token.faction !== options.enemy )
                && ( !options.player || token.faction === options.player );
        });
    },

    discardToken( token, area ){
        if( area.data ) area = area.data;
        let tokenSpace = false;

        token.location = null;
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
