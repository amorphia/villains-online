let Area = require( './Area' );

class Capitol extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.maxTokens = 6;
        this.data.control = "Collect this turn's Capitol Token";
        this.data.skill = "Exchange the position of two action tokens in the same area";
        this.data.adjacent = [ 'sewers', 'police', 'laboratory', 'bank', 'factory', 'university', 'subway', 'church' ];
    }


    /**
     * Handle our onControl event during the determine control step
     *
     * @param faction
     */
    onControl( faction ){
        // get this turn's capitol control token
        let token = faction.game().capitolTokens[ this.game().data.turn - 1 ];

        // add it to our faction's collection
        faction.data.capitolTokens.push( token );

        // and grant that faction the appropriate AP
        faction.gainAP( token.ap );

        // announce this to all players
        faction.message( `Collects this turn's capitol token`, {
            type : 'capitol-token',
            turn : this.game().data.turn
        });

        return token;
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction

    takeControl( faction ){
        faction.data.collectsCapitolToken = true;
    }
     */

    /**
     * Handle a faction losing control of this area
     *
     * @param faction

    loseControl( faction ){
        faction.data.collectsCapitolToken = false;
    }
     */


    /**
     * Resolve this area's skill ability
     *
     * @param faction
     */
    async skill( faction ){

        // get legal areas to swap tokens, if there are none abort
        let areasWithTwoTokens = this.areasWithTwoTokens();
        if( ! areasWithTwoTokens.length  ){
            faction.message( "No areas with 2+ tokens to swap", { class: 'warning' } );
            return false;
        }

        // player chooses tokens
        let response = await faction.prompt( 'choose-tokens', {
            count : 2,
            areas : areasWithTwoTokens,
            sameArea : true
        });

        // swap tokens
        let tokens = response.tokens.map( token => faction.game().objectMap[ token ] );
        this.swapTokens( tokens, faction );
    }


    /**
     * Return an array of area names that have at least two tokens in them
     *
     * @returns {string[]}
     */
    areasWithTwoTokens(){
        let areas = {};

        Object.values( this.game().areas ).forEach( area => {
            if( area.data.tokens.length >= 2 ) areas[area.name] = true;
        });

        return Object.keys( areas );
    }


    /**
     * Swap two token positions
     *
     * @param tokens
     * @param faction
     */
    swapTokens( tokens, faction ){

        // abort if something went wrong
        if( tokens.length !== 2 || tokens[0].location !== tokens[1].location ){
            this.game().message( "Token count wrong, or token locations don't match", { class: 'warning' });
            return;
        }

        // get our area, and token indexes
        let area = this.game().data.areas[tokens[0].location];
        let tokenZeroIndex = _.findIndex( area.tokens, token => token.id === tokens[0].id );
        let tokenOneIndex = _.findIndex( area.tokens, token => token.id === tokens[1].id );

        // swap token indexes
        area.tokens[tokenZeroIndex] = tokens[1];
        area.tokens[tokenOneIndex] = tokens[0];

        // announce the swap
        faction.message( `swaps <span class="faction-${tokens[0].faction}">the ${tokens[0].faction}</span> token (${tokenZeroIndex + 1} ) with <span class="faction-${tokens[1].faction}">the ${tokens[1].faction}</span> token (${tokenOneIndex + 1}) in the ${area.name}` );
    }

}

module.exports = Capitol;
