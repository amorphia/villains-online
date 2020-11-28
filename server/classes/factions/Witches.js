let Faction = require( './Faction' );


class Witches extends Faction {
    name = 'witches';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Witches of Havlocke";
        this.data.focus = 'rule-focus';
        this.data.focusDescription = "Play many rule cards";
        this.data.magickCardsRevealed = 1;
        this.data.lastMagickGameAction = 0;
        this.data.magickCardsFree = false;

        this.data.flippedUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];

        // icons
        this.data.statusIcon = 'enchanted';
        this.data.statusDescription = 'has enchanted units';

        // tokens
        this.tokens['brew'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'brew',
                cost: 0,
                resource : 1
            }
        };


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Cordella",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [9,9,9],
                cost: 1,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onDeploy : 'cordellaDeploy',
            }
        };
    }


    processUpgrade( n ){
        if( n === 1 ){
            this.data.magickCardsRevealed = 2;
        } else {
            this.data.magickCardsRevealed = 2;
            this.data.magickCardsFree = true;
        }
    }

    async revealMagick( area ){
        let player, data, cards;

        this.game().popup( this.playerId, { magick : true, area : area.name, faction : this.name });

        this.drawCards( this.data.magickCardsRevealed );
        cards = this.data.cards.hand.slice( -this.data.magickCardsRevealed );

        this.game().message({
            faction : this,
            message: `use magick in the <span class="highlight">${area.name}</span> revealing:`,
            type : 'cards',
            cards : cards,
        });

        let args = {
            area : area.name,
            cards : cards,
            free : this.data.magickCardsFree
        };

        if( this.data.magickCardsFree ) args.cost = 0;

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-magick',
            data : args
        }).catch( error => console.error( error ) );

        // discard unselected cards (if any)
        if( data.unselected.length ) this.discardCard( data.unselected );

        return [args, data, data.selected];
    }


    dienchantUnits( area ){
        this.data.units.forEach( unit => {
            if( unit.location === area.name && unit.flipped ) this.unitUnflipped( unit );
        })
    }


    async magickAction( area ){
        let player, data, args, card;

        this.data.lastMagickGameAction = this.game().data.gameAction + 1;

        this.dienchantUnits( area );
        [args, data, card] = await this.revealMagick( area );

        if( !card ) return this.game().message({ faction : this, message : 'decline to cast a magick spell' });

        args.area = this.game().areas[args.area];
        data.cardId = card;
        data.cost = this.data.magickCardsFree ? 0 : this.game().objectMap[ card ].cost;

        await this.processCard( args, data );
    }


    canActivateBrew( token, area ) {
        return !! this.data.tokens.find( token => token.location === area.name && token.revealed && token.type !== 'brew' );
    }


    async brewToken( args ) {
        this.data.tokens.forEach( token => {
            if(
                token.location === args.area.name
                && token.revealed
                && token.type !== 'brew'
            ){
                token.revealed = false;
            }
        });

        this.game().message({ faction : this, message: `Flip their tokens face down in The ${args.area.name}` });
        this.game().advancePlayer();
    }

    enchantUnits(){
        let areas = this.areas();

        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit ) && !unit.flipped ) this.enchantUnit( unit )
        });
    }

    enchantUnit( unit ){
        unit.flipped = true;
    }

    getTokenMoveAreas( toArea ){
       let areas = [];

       Object.values( this.game().data.areas ).forEach( area => {
           if( toArea.data.adjacent.includes( area.name )
               && area.tokens.find( token => token.faction === this.name && !token.revealed ) ) areas.push( area.name );
       });

       return areas;
    }

    async cordellaTokenMove( cordella ){
        let player, data, area = this.game().areas[cordella.location];

        // get adjacent areas with valid tokens to move
        let areasWithValidTokens = this.getTokenMoveAreas( area );
        // if we don't have any valid tokens to move abort
        if( ! areasWithValidTokens.length ) return this.game().message({ faction: this, message : 'No valid tokens for Cordella to move' });

        // player optionally chooses a token to move
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-tokens',
            data : {
                count : 1,
                areas : areasWithValidTokens,
                optional : true,
                playerOnly : true,
                unrevealedOnly: true,
                message : `Flip Cordella to move a token to the ${area.name}?`
            }
        }).catch( error => console.error( error ) );

        // if we didn't choose a token, abort
        if( !data.tokens ) return this.game().message({ faction: this, message : `Declines to move a token to the ${area.name}` });

        // unflip cordella
        this.unitUnflipped( cordella );

        // move token
        let token = this.game().objectMap[ data.tokens[0] ] ;

        // remove from old area
        let fromArea = this.game().areas[token.location];
        _.discardToken( token, fromArea );

        //move to new area
        token.location = area.name;
        area.data.tokens.push( token );
        this.game().message({ faction: this, message : `Cordella spends her magick to move a token from The ${fromArea.name} to the ${area.name}` });
    }

    async cordellaDeploy( event ){
        this.enchantUnit( event.unit );
    }

    factionCleanUp(){
        this.enchantUnits();
    }

    unitUnflipped( unit ) {
        unit.flipped = false;
    }

}


module.exports = Witches;
