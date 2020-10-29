let mixin = {

    isOpen(){
        return this.data.state === 'open';
    },

    areasWithUnrevealedTokens( output = 'array' ){
        let areasWithUnrevealedTokens = {};

        _.forEach( this.areas, area => {
            if( _.find( area.data.tokens, token => !token.revealed ) ) areasWithUnrevealedTokens[area.name] = true
        });

        if( output === 'array' ) areasWithUnrevealedTokens = Object.keys( areasWithUnrevealedTokens );

        return areasWithUnrevealedTokens;
    }

};

module.exports = mixin;
