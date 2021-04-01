let Area = require( './Area' );


class Laboratory extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You draw an extra card during the DRAW ACTION CARDS step";
        this.data.skill = "Reveal the top card of the action deck: you may play that card for free in The Laboratory or draw it";
        this.data.adjacent = [ 'police', 'capitol', 'factory' ];
    }

    takeControl( faction ){
        faction.data.cardDraw++;
    }

    loseControl( faction ){
        faction.data.cardDraw--;
    }

    async skill( faction ){
        let player = {}, data = {};

        faction.drawCards();

        let card = _.last( faction.data.cards.hand );
        faction.game().message({
            faction : faction,
            message: `reveals`,
            type : 'cards',
            cards : [card]
        });

        let args = {
            area : 'laboratory',
            cards : [card],
            cost : 0,
            message : 'Play this card for free in the Laboratory?',
            declineMessage : 'draw this card',
            saveMessage : 'play this card in the laboratory',
            free : true
        };

        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-card',
            data : args
        }).catch( error => console.error( error ) );


        if( data.decline ){
            faction.game().message({
                faction : faction,
                message: `chooses not to play the card`
            });
            return;
        }

        args.area = faction.game().areas[args.area];
        args.cost = 0;
        await faction.resolveCard( args, data );
    }
}

module.exports = Laboratory;
