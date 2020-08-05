let obj = {

    async revealToken( player, token, area ) {

        if( token.resource ) this.gainResources( 1 );
        token.revealed = true;

        this.game().message({ message: 'reveal', type : 'reveal-token', faction : this, token : token });
        this.game().popup( player, { token : token, area : area.name, faction: this.name });

        try {
            for( let faction of Object.values( this.game().factions ) ){
                await faction.onAfterReveal( token );
            }
        } catch( error ){
            console.error( error );
        }

        if( ! this.canActivate( token, area ) ){
            this.sound( 'error' );
            this.game().declineToken( player, token );
        } else {
            let cost = this.tokenCost( token, area );
            this.game().listen({ name : 'activate-decline', players : player, data : { token : token, cost : cost } });
            this.game().updateAll();
        }
    },


    tokenCost( token, area ){
        let cost = token.cost;
        if( _.find( area.data.tokens, token => token.activateTax && token.revealed && token.faction !== this.name ) ) cost++; // credit freeze
        return cost;
    },


    canActivate( token, area ){
        let tokenMethod = 'canActivate' + _.classCase( token.type );
        return this[tokenMethod]( token, area );
    },


    activateToken( player, token ){
        let area = this.game().areas[token.location];
        this.payCost( this.tokenCost( token, area ), true );
        this.game().message({ message: `Activate their <span class="highlight">${token.name}</span> token`, faction : this });

        let action = _.camelCase( token.name ) + 'Token';
        this[action]({ player : player, token : token, area : area });

    }

};


module.exports = obj;

