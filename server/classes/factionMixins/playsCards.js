let obj = {

    canActivateCard( token, area ){
        let lowestCost = this.data.cards.hand.reduce( (acc, card) => {
            return card.cost < acc ? card.cost : acc;
        }, 100 );

        return this.money() >= lowestCost;
    },


    async cardToken( args ) {
        let output = await this.playACard( args );

        if( output.declined ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.game().advancePlayer();
    },


    async playACard( args ){
        let player = args.player;
        let data = {
            area : args.area.name,
            free : args.free,
            cards : args.cards || [],
            fusion : args.fusion
        };

        [ player, data ] = await this.game().promise({ players: player, name: 'choose-card', data : data });
        return this.processCard( args, data );
    },


    async processCard( args, data ){
        if( data.decline ) return { declined : true };

        let card = this.game().objectMap[ data.cardId ];
        this.payCost( data.cost );
        this.placeCardInProperArray( card, args.area );

        let message = `Pay xC${data.cost}x to play <span class="highlight">${ card.name }</span>`;
        this.message({ message: message, faction : this, type: 'cards', cards: [card], area : args.area });

        await this.game().cards[ card.class ].handle( this, args.area );
        return { cost: data.cost, card: card, area: data.areaName };
    },


    placeCardInProperArray( card, area ){
        let target;
        if( card.type === 'event' ){
            target = this.game().deck.discard;
        } else if( card.scope === 'local' ){
            card.owner = this.name;
            target = area.data.cards;
        } else {
            target = this.data.cards.active;
        }

        _.moveItemById( card.id, this.data.cards.hand, target );

        // sort cards by faction in location
        if( card.scope === 'local' ){
            area.data.cards = _.orderBy( area.data.cards, 'owner', 'asc' );
        }

    }

};

module.exports = obj;
