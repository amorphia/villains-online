let mixin = {

    /**
     * Is this game currently waiting to begin?
     *
     * @returns {boolean}
     */
    isOpen(){
        return this.data.state === 'open';
    },



    /**
     * Return areas that have at least one unrevealed action token in it
     *
     * @param output
     * @returns {object|array}
     */
    areasWithUnrevealedTokens( output = 'array' ){
        let areasWithUnrevealedTokens = {};

        _.forEach( this.areas, area => {
            if( _.find( area.data.tokens, token => token.id && !token.revealed ) ) areasWithUnrevealedTokens[area.name] = true
        });

        if( output === 'array' ) areasWithUnrevealedTokens = Object.keys( areasWithUnrevealedTokens );

        return areasWithUnrevealedTokens;
    },
};

module.exports = mixin;
