let obj = {

    /**
     * Draw the action cards we are entitled to draw at the start of each turn
     */
    drawTurnCards(){
        let cardsToDraw = this.data.cardDraw;

        // if we are the last player in a 5 player game, and this is the first turn then draw an extra card
        if( this.gainsLastPlayerBonus() ){
            this.message( 'Draws an extra card for going last in a 5 player game' );
            cardsToDraw++;
        }

        if( this.game().data.ignoredAreas.length && this.threePlayerExtraDraw ){
            cardsToDraw++;
        }

        // draw our cards
        this.drawCards( cardsToDraw );
    },


    /**
     * Do we deserve the last player bonus (being 5th in player order in a 5 player game)?
     *
     * @returns {boolean}
     */
    gainsLastPlayerBonus(){
        return this.game().data.turn === 1 && this.game().data.playerOrder[4] === this.playerId;
    },


    /**
     * Draw n action cards
     * @param {number} number // how many cards to draw
     * @param {boolean} displayToPlayer // should we show the drawing player the cards in the game log?
     */
    drawCards( number = 1, displayToPlayer = false ){

        // draw n cards
        for( let i = 0; i < number; i++ ){
            this.data.cards.hand.push( this.game().drawCard() );
        }
        this.message( `Draw ${ number } card${ number > 1 ? 's' : ''}` );


        // if we don't need to display the cards, then abort
        if( !displayToPlayer ) return;

        // display drawn cards to our player
        let newCards = this.data.cards.hand.slice( -number );
        this.messagePlayer({
            message : 'You drew the following',
            type : 'cards',
            cards : newCards
        });

    },


    /**
     * Discard action cards
     *
     * @param cards
     * @param options
     */
    discardCards( cards, options = {} ){
        // if we only supplied a card object, wrap that card in an array
        if( !Array.isArray( cards ) ) cards = [cards];

        // get our card objects
        cards = cards.map( card => {
            return typeof card === 'string' ? this.game().objectMap[card] : card;
        });

        // move each card from our hand to the discard pile
        for( let card of cards ) {
            let destination = options.bottomOfDeck ? this.game().deck.deck : this.game().deck.discard;
            _.moveItemById(
                card.id,
                this.data.cards.hand,
                destination,
                "unshift",
            );
        }

        // announce the discard
        if( options.bottomOfDeck ){
            return this.message(`discards a card to the bottom of the deck` );
        }

        this.message(`discards cards`, { type: 'cards', cards: cards } );

        return cards;
    },


    /**
     * Can we activate this card token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateCard( token, area ){
        return this.hasPlayableCard();
    },

    hasPlayableCard( free = false ){
        // do we have any cards in hand?
        if( !this.data.cards.hand.length ) return false;

        // if we have a card, and don't need to pay costs them we good
        if( free ) return true;

        // otherwise get the lowest cost card in our hand, otherwise return an impossibly
        // high cost that we could never possibly pay
        let lowestCost = this.data.cards.hand.reduce( (acc, card) => {
            return card.cost < acc ? card.cost : acc;
        }, 100 );

        return this.money() >= lowestCost;
    },

    /**
     * Activate a card token
     *
     * @param args
     */
    async activateCardToken( args ) {
        let output;
        let cardsPlayed = 0;
        let declined = false;
        let advance = true;

        // play a numbers of cards up to our card limit
        while( cardsPlayed < this.data.cardLimit && !declined ) {
            output = await this.playACard( args );

            if( output?.dontAdvancePlayer ){
                advance = false;
            }

            if( output?.declined ){
                declined = true;
            } else {
                cardsPlayed++;
            }
        }

        // if we declined without playing a single card
        if( declined && cardsPlayed === 0 ){
            if( !args.pod ) this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        // handle onActivateToken triggers
        await this.handleAfterActivateTokenTriggers( args );

        this.game().advancePlayer( {}, advance );
    },


    /**
     * Play an action card
     *
     * @param args
     * @returns {Promise<*|{declined}|{area, cost, card}>}
     */
    async playACard( args ){
        let player = args.player;
        let response;
        let data = {
            area : args.area.name,
            free : args.free,
            cards : args.cards || [],
            fusion : args.fusion,
            reduceCost : args.reduceCost,
            message: args.message,
        };

        [player, response] = await this.game().promise({ players: player, name: 'choose-card', data : data })
            .catch( error => console.error( error ) );

        let results = await this.resolveCard( args, response );

        // handle any faction "onAfterSkill" triggered events
        if( this.triggers.onAfterCardPlayed && results.card ) await this[this.triggers.onAfterCardPlayed]( results );

        return results;
    },


    async resolveCard( args, response ){
        // if we declined to resolve a card abort
        if( response.decline ) return { declined : true };

        // get our card object
        let card = this.game().objectMap[ response.cardId ];

        // track our card play
        this.game().data.cardTracker[card.class].played++;

        // pay its cost
        this.payCost( response.cost, false, 'card' );

        // move this card into the proper array of resolved cards
        this.placeCardInProperArray( card, args.area );

        // announce the card play
        let message = `Pay xC${response.cost}x to play <span class="highlight">${ card.name }</span>`;
        this.message( message, { type: 'cards', cards: [card], area : args.area });

        // new up our card class
        let cardClass = this.game().cards[ card.class ];
        let cardOutput = await new cardClass().resolve( this, args.area );

        // return our output
        return { cost: response.cost, card: card, area: response.areaName, dontAdvancePlayer: cardOutput?.dontAdvancePlayer };
    },


    /**
     * Place this card in the proper array depending on its type
     *
     * @param card
     * @param area
     */
    placeCardInProperArray( card, area ){
        // get our array
        let array = this.getResolvedCardArray( card, area );

        // move our card to the proper array
        _.moveItemById( card.id, this.data.cards.hand, array );

        // sort local cards by faction in area
        if( card.scope === 'local' ){
            area.data.cards = _.orderBy( area.data.cards, 'owner', 'asc' );
        }
    },


    /**
     * Get the proper array to place a resolved card in
     *
     * @param card
     * @param area
     * @returns {[]}
     */
    getResolvedCardArray(  card, area  ){
        // if the card is an event, just throw it in the discard
        if( card.type === 'event' ){

            let collectDiscardsToken = area.data.tokens.find( token => token.collectDiscardedCards  && token.revealed );
            if(collectDiscardsToken){
                let faction = this.game().factions[collectDiscardsToken.faction];
                faction.message(`Scrounges a ${card.name} card from the trash`);
                return faction.data.cards.hand;
            }

            return this.game().deck.discard;
        }

        // if this is a local rule, store it with the area where it was played
        if( card.scope === 'local' ){
            card.owner = this.name;
            return area.data.cards;
        }

        // otherwise this is a global rule, so store it with the faction
        card.playedIn = area.name;
        return this.data.cards.active;
    }

};

module.exports = obj;
