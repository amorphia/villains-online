let Faction = require( './Faction' );


class Witches extends Faction {
    name = 'witches';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onCleanUp" : "enchantUnits"
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Witches of Havlocke";
        this.data.focus = 'rule-focus';
        this.data.focusDescription = "Play many rule cards";
        this.data.magickCardsRevealed = 1;
        this.data.lastMagickGameAction = 0;
        this.data.magickCardsFree = false;

        this.data.flipableUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];

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
                resource : 1,
                req : "This token must be discarded if you don't flip down any other tokens"
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
                onDeploy : 'cordellaDeployTrigger',
            }
        };
    }


    /**
     * Process this faction's upgrades
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        if( upgrade === 1 ){
            // reveal two cards instead of one
            this.data.magickCardsRevealed = 2;
        } else {
            // reveal two cards instead of one aaaaand playing the card is freeeeeee!
            this.data.magickCardsRevealed = 2;
            this.data.magickCardsFree = true;
        }
    }


    /**
     * Handle the take magick action
     *
     * @param player
     * @param areaName
     */
    async takeMagickAction( player, areaName ){
        let area = this.game().areas[areaName];

        // We can't take a magick action twice in a row
        if( this.game().data.gameAction === this.data.lastMagickGameAction ) {
            this.message({ message: 'Too soon to magick again', class: 'warning' });
            return;
        }

        // resolve our magick action
        try {
            await this.resolveMagickAction( area );
        } catch( error ){
            console.error( error );
        }

        // advance to the next action, but don't advance to the next player
        this.game().advancePlayer( {}, false );
    }


    /**
     * Resolve the Magick action
     *
     * @param area
     */
    async resolveMagickAction( area ){
        let player, data, args, card;

        // record this game action as the last time we resolved the magick action (we haven't incremented
        // the gameAction counter yet for this action, so we gotta add one to it now)
        this.data.lastMagickGameAction = this.game().data.gameAction + 1;

        // flip our units in this area to their regular side
        this.disenchantUnits( area );

        // reveal our magick card(s) and allow the player to decide which to play
        [args, data, card] = await this.revealMagickCards( area );

        // if the player can't / wont play any of the revealed cards, exit
        if( !card ){
            this.game().message({ faction : this, message : 'decline to cast a magick spell' });
            return
        }

        // prepare our data, then resolve our action card
        args.area = this.game().areas[args.area];
        data.cardId = card;
        data.cost = this.data.magickCardsFree ? 0 : this.game().objectMap[ card ].cost;
        await this.resolveCard( args, data );
    }


    /**
     * Reveal Magick cards and allow player to choose one to resolve (if applicable)
     *
     * @param area
     */
    async revealMagickCards( area ){
        let player, data;

        // show magick popup
        this.game().popup( this.playerId, { magick : true, area : area.name, faction : this.name });

        // draw our magick cards
        let cards = this.drawMagickCards( area );

        let args = {
            area : area.name,
            cards : cards,
            free : this.data.magickCardsFree
        };

        // if we have our second upgrade, all cards are freeeeee!
        if( this.data.magickCardsFree ) args.cost = 0;

        // allow player to select a valid card (if any)
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-magick',
            data : args
        }).catch( error => console.error( error ) );

        // discard unselected cards (if any)
        if( data.unselected.length ) this.discardCard( data.unselected );

        return [args, data, data.selected];
    }


    /**
     * Draw cards to be revealed to our magick ability
     *
     * @returns {array}
     */
    drawMagickCards( area ){
        // draw cards equal to our magickCardsRevealed property, then remove them from our hand because we
        // don't actually want to treat them as regularly drawn cards
        this.drawCards( this.data.magickCardsRevealed );
        let cards = this.data.cards.hand.slice( -this.data.magickCardsRevealed );

        // reveal the cards to all players
        this.game().message({
            faction : this,
            message: `use magick in the <span class="highlight">${area.name}</span> revealing:`,
            type : 'cards',
            cards : cards,
        });

        return cards;
    }


    /**
     * Flip our enchanted units in this area to their front side
     *
     * @param area
     */
    disenchantUnits( area ){
        this.data.units.forEach( unit => {
            if( unit.location === area.name && unit.flipped ) this.unflipUnit( unit );
        })
    }


    /**
     * Can we activate our brew token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateBrew( token, area ) {
        // do we have at least one other revealed token in this area? Then yes.
        return !! this.data.tokens.find( token => token.location === area.name
                                               && token.revealed
                                               && token.type !== 'brew' );
    }


    /**
     * Resolve our brew token
     *
     * @param args
     */
    async brewToken( args ) {

        // flip each token in this area that is revealed, except the brew token itself
        this.data.tokens.forEach( token => {
            if( token.location === args.area.name
                && token.revealed
                && token.type !== 'brew'
            ){
                token.revealed = false;
            }
        });

        this.game().message({ faction : this, message: `Flip their tokens face down in The ${args.area.name}` });
        this.game().advancePlayer();
    }


    /**
     * Each unit in play becomes enchanted
     */
    enchantUnits(){
        console.log( 'run enchant units' );
        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit ) && !unit.flipped ) this.enchantUnit( unit )
        });
    }


    /**
     * The given unit becomes enchanted
     *
     * @param unit
     */
    enchantUnit( unit ){
        unit.flipped = true;
    }


    /**
     * When cordella is deployed, she becomes enchanted
     *
     * @param event
     */
    async cordellaDeployTrigger( event ){
        this.enchantUnit( event.unit );
    }

}


module.exports = Witches;
