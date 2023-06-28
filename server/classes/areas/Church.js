let Area = require( './Area' );

class Church extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You may complete your plan objectives in any order";
        this.data.skill = "Flip one of your face-up action tokens face-down";
        this.data.adjacent = [ 'sewers', 'subway', 'capitol' ];
        this.data.adjacentAlts = {
            sewers : "police",
            subway: "university",
        };
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    takeControl( faction ){
        faction.data.anyOrderPlans = true;
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    loseControl( faction ){
        faction.data.anyOrderPlans = false;
    }


    /**
     * Return an array of area names for the the areas where we have revealed tokens
     *
     * @param faction
     * @returns {string[]}
     */
    areasWithRevealedTokens( faction ){
        let areas = {};

        // cycle through our tokens
        faction.data.tokens.forEach( token => {
            // if this token is in play, not on xavier, and not revealed add its location to our areas
            if( token.location && token.location !== 'xavier' && token.revealed ){
                areas[token.location] = true;
            }
        });

        return Object.keys( areas );
    }


    /**
     * Resolve this area's skill ability
     *
     * @param faction
     */
    async skill( faction ){

        // get areas where we have a revealed token, and if there are none abort
        let areasWithRevealedTokens = this.areasWithRevealedTokens( faction );
        if( ! areasWithRevealedTokens.length  ){
            faction.message( "No tokens to flip with Church skill ability", { class: 'warning' } );
            return false;
        }

        // prompt our player to choose a token to flip faced down
        let response = await faction.prompt( 'choose-tokens', {
            count : 1,
            areas : areasWithRevealedTokens,
            playerOnly : true,
            revealedOnly : true
        });

        // handle our response
        this.resolveTokenFlipResponse( response, faction );
    }


    /**
     * Resolve our token flip ability
     *
     * @param response
     * @param faction
     */
    resolveTokenFlipResponse( response, faction ){
        // if we didn't choose a token, abort
        if( !response.tokens ) return;

        // get our token object
        let token = faction.game().objectMap[ response.tokens[0] ];

        // flip it face down
        token.revealed = false;

        // announce our response
        faction.message( `flips their <span class="faction-${token.faction}">${token.name}</span> token in the ${token.location} face down` );
    }

}

module.exports = Church;
