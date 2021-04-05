let obj = {

    upgradeVariableTokens( upgrade, tokenCache ){
        let tokensToAdd = _.min( [ upgrade, tokenCache.length ] );
        while( tokensToAdd ){
            this.data.tokens.push( tokenCache.pop() );
            tokensToAdd--;
        }
    },


    setupVariableTokens( tokenName, tokenCache ){
        let numToSetAside = 2 - this.data.upgrade;

        if( numToSetAside > tokenCache.length ){
            while( numToSetAside > tokenCache.length ){
                console.log( 'first loop' );
                let token = this.data.tokens.find( obj => obj.type === tokenName && !obj.location && !obj.revealed );
                if( token ) _.moveItemById( token.id, this.data.tokens, tokenCache );
            }
        } else if( numToSetAside < tokenCache.length ){
            while( numToSetAside < tokenCache.length ) {
                console.log( 'second loop' );
                this.data.tokens.push( tokenCache.pop() );
            }
        }
    }
};

module.exports = obj;
