let obj = {

    async revealToken( player, token, area, wildType ) {

        if( token.resource ) this.gainResources( 1 );
        token.revealed = true;

        this.game().message({ message: 'reveal', type : 'reveal-token', faction : this, token : token });
        this.game().popup( player, { token : token, area : area.name, faction: this.name });

        if( wildType ){
            this.game().message({ message : `have chosen to treat their <span class="faction-robots">wild</span> token as a <span class="capitalize highlight">${wildType}</span> token`, faction : this });
            if( wildType === 'battle' ) this.gainResources( 1 );
        }

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
            let cost = this.tokenCost( token, area, wildType );
            this.game().listen({ name : 'activate-decline', players : player, data : { token : token, cost : cost, wildType : wildType } });
            await this.game().updateAll();
        }
    },


    tokenCost( token, area = null, wildType = null ){
        if( !area ) area = this.game().areas[ token.location ];

        let cost = token.cost;
        if( wildType === 'move' ) cost = 2;

        // credit freeze
        if( area.hasToken( 'credit-freeze' ) && this.name !== 'bankers' ){
            cost++;
            console.log( 'credit freeze applied' );
        }
        return cost;
    },


    canActivate( token, area ){
        let tokenMethod = 'canActivate' + _.classCase( token.type );
        return this[tokenMethod]( token, area );
    },


    activateToken( player, token, wildType ){
        let area = this.game().areas[token.location];
        let cost = this.tokenCost( token );
        if( cost > 0 ) this.payCost( cost, true );

        let message = `Activate their <span class="highlight">${token.name}</span> token`;
        this.game().message({ message: message, faction : this });

        let action = _.camelCase( token.name ) + 'Token';
        this[action]({ player : player, token : token, area : area, wildType : wildType });
    }

};


module.exports = obj;

