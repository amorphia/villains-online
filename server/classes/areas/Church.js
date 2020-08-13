let Area = require( './Area' );

class Church extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You may complete your plan objectives in any order";
        this.data.skill = "Flip one of your face-up action tokens face-down";
        this.data.adjacent = [ 'sewers', 'subway', 'capitol' ];
    }

    takeControl( faction ){
        faction.data.anyOrderPlans = true;
    }

    loseControl( faction ){
        faction.data.anyOrderPlans = false;
    }

    areasWithRevealedTokens( faction ){
        let areasWithRevealedTokens = {};
        faction.data.tokens.forEach( token => {
            if( token.location
                && token.location !== 'xavier'
                && token.revealed
            ) areasWithRevealedTokens[token.location] = true;
        });
        return Object.keys( areasWithRevealedTokens );
    }

    async skill( faction ){
        let player = {}, data = {};


        let areasWithRevealedTokens = this.areasWithRevealedTokens( faction );
        if( ! areasWithRevealedTokens.length  ){
            faction.game().message({
                faction : faction,
                message: "No tokens to flip with Church skill ability",
                class: 'warning' });
            return false;
        }


        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-tokens',
            data : {
                count : 1,
                areas : areasWithRevealedTokens,
                playerOnly : true,
                revealedOnly : true
            }
        }).catch( error => console.error( error ) );

        if( !data.tokens ) return;
        let token = faction.game().objectMap[ data.tokens[0] ];
        token.revealed = false;

        faction.game().message({
            faction : faction,
            message: `flips their <span class="faction-${token.faction}">${token.name}</span> token in the ${token.location} face down`
        });
    }
}

module.exports = Church;
