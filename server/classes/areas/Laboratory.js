let Area = require( './Area' );


class Laboratory extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You draw an extra card during the DRAW ACTION CARDS step";
        this.data.skill = "Reveal the top card of the action deck: you may play that card for free in The Laboratory or draw it";
        this.data.adjacent = [ 'police', 'capitol', 'bank' ];
        this.data.adjacentAlts = {
            police : "sewers",
            bank: "factory",
        };
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    takeControl( faction ){
        faction.data.cardDraw++;
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    loseControl( faction ){
        faction.data.cardDraw--;
    }

    /**
     * Resolve this area's skill ability
     *
     * @param faction
     */
    async skill( faction ){

        // draw a card
        faction.drawCards();

        // get the card we just drew
        let card = _.last( faction.data.cards.hand );

        // reveal the card to all players
        faction.message( `reveals`, { type : 'cards', cards : [card] });

        let args = {
            area : 'laboratory',
            cards : [card],
            cost : 0,
            message : 'Play this card for free in the Laboratory?',
            declineMessage : 'draw this card',
            saveMessage : 'play this card in the laboratory',
            free : true
        };

        // prompt the player to play this card
        let response = await faction.prompt( 'choose-card', args );

        // handle the response
        await this.resolveChooseCardResponse( response, faction, args );
    }


    /**
     * Handle the response to our choose-card prompt
     *
     * @param response
     * @param faction
     * @param args
     */
    async resolveChooseCardResponse( response, faction, args ){

        // if we declined to play the card, abort
        if( response.decline ){
            faction.message( `chooses not to play the card` );
            return;
        }

        // set some additional arguments
        args.area = this.game().areas[args.area];
        args.cost = 0;

        // play the card
        await faction.resolveCard( args, response );
    }
}

module.exports = Laboratory;
