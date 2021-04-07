let Card = require( './Card' );

class Stupor extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){

        if( !this.hasTokensToStupor() ){
            this.faction.message( "No tokens to stupor", { class : 'warning'  });
            return false;
        }

        // ask which token to stupor
        let response = await this.faction.prompt( 'choose-tokens', {
            count : 1,
            areas : [this.area.name],
            enemyOnly : true,
            unrevealedOnly : true
        });

        // discard the token
        let token = this.game.objectMap[response.tokens[0]];
        let tokenSpot = _.discardToken( token, this.area );

        // display results
        let message = `Removes <span class="faction-${token.faction}">the ${token.faction} token</span> from the ${tokenSpot} slot of the ${this.area.name}`;
        this.faction.message( message );
    }


    /**
     * Do we have tokens to stupor?
     *
     * @returns {boolean}
     */
    hasTokensToStupor(){
        // does this area have a token belonging to another player that hasn't been revealed?
        return this.area.data.tokens.some( token => token.faction !== this.faction.name && !token.revealed );
    }
}

module.exports = Stupor;
