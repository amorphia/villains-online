let Faction = require( './Faction' );


class Agency extends Faction {
    name = 'agency';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onCleanUp" : "resetTrackers",
            "onFactionKillsUnit" : "checkKilledChampion",
            "onAfterCardPlayed" : "incrementEventCardTracker",
        };

        //data
        this.data.name = this.name;
        this.data.title = "Section Seven";
        this.data.focusDescription = "Play many event cards";

        // icons
        this.data.flipableUnits = ['patsy'];
        this.data.hasKilledChampion = false;
        this.data.eventCardsPlayed = 0;
        this.data.maxWoundAgentActions = 0;
        this.data.usedWoundAgentActions = 0;
        this.data.lastAgentGameAction = 0; // used to track if we are permitted to use agent again

        // tokens
        this.tokens['intel'] = {
            count: 2,
            data: {
                influence: 1,
                type: 'intel',
                cost: 0,
                resource: 1,
                description: "Reveal a card from the action deck for each type of basic enemy unit in this area, you may play any event cards revealed this way here (pay costs normally) and discard the rest.",
                req :  "Discard this token if no cards are revealed after activating it"
            }
        };

        this.units['patsy'].count = 2;
        this.units['patsy'].data.toughness = true;
        this.units['patsy'].data.canDeployFlipped = false;
        this.units['patsy'].data.flipped = false;
        this.units['patsy'].data.onWounded = 'becomeAgent';


        this.units['champion'] = {
            count: 1,
            data: {
                name: "The Surveyor",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [3],
                cost: 1,
                flipped: false,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                toughness: true,
                seeking: false,
                onBeforeAttack: 'surveyorOnBeforeAttack',
                //onAfterAttack: 'surveyorOnAfterAttack',
                onDeploy: 'surveyorDragToken',
            }
        };
    }

    /**
     * Process faction upgrade
     */
    processUpgrade( upgrade ) {
        this.data.maxWoundAgentActions = upgrade === 1 ? 1 : 100;
    }

    async takeAgentAction( player, areaName ){
        let area = this.game().areas[areaName];

        // show agent popup
        this.game().popup( this.playerId, { type: 'agent', area : areaName, faction : this.name });

        // We can't take an agent action twice in a row
        if( this.game().data.gameAction === this.data.lastAgentGameAction ) {
            this.message('Too soon to agent again', { class: 'warning' } );
            return;
        }

        // can only take this action so many times a turn depending on upgrades
        if( this.data.usedWoundAgentActions >= this.data.maxWoundAgentActions ) {
            this.message('All agent actions used up', { class: 'warning' } );
            return;
        }

        // need a face-up patsy to wound here
        let patsies = this.unitsInArea( area, { type: "patsy", notFlipped: true } );
        if( !patsies.length ) {
            this.message('No face up patsies in this area', { class: 'warning' } );
            return;
        }

        // need a card or intel token to flip face down here
        let tokens = this.tokensInArea( area, { typeIn: ["card", "intel"], revealed: true } );
        if( !tokens.length ) {
            this.message('No valid tokens in this area', { class: 'warning' } );
            return;
        }

        // resolve our agent action
        try {
            await this.resolveAgentAction( area );
        } catch( error ){
            console.error( error );
        }

        // advance to the next action, but don't advance to the next player
        this.game().advancePlayer( {}, false );
    }


    async resolveAgentAction( area ){
        // record this game action as the last time we resolved the magick action (we haven't incremented
        // the gameAction counter yet for this action, so we gotta add one to it now)
        this.data.lastAgentGameAction = this.game().data.gameAction + 1;

        // choose a patsy
        // prompt player to select a unit to attack with
        let response = await this.prompt( 'choose-units', {
            count : 1,
            areas : [ area.name ],
            playerOnly : true,
            unitTypes: ["patsy"],
            unflippedOnly: true,
            canDecline: true,
            message: "Choose a face-up patsy to become wounded",
        });

        if( !response.units ) return this.message("Declines to wound a patsy", { class: "warning" });
        let patsy = this.game().objectMap[ response.units[0] ];

        // prompt our player to choose a token to flip faced down
        response = await this.prompt( 'choose-tokens', {
            count : 1,
            areas : [ area.name ],
            playerOnly : true,
            revealedOnly : true,
            typeIn : ["intel", "card"],
            message : "Choose a revealed CARD or INTEL token to flip face down",
        });

        // prepare our data, then resolve our action card
        // if we didn't choose a token, abort
        if( !response.tokens ) return this.message("Declines to flip a token", { class: "warning" });

        // wound patsy
        this.becomeAgent( patsy );

        // get our token object
        let token = this.game().objectMap[ response.tokens[0] ];

        // flip it face down
        token.revealed = false;

        // announce our response
        this.message( `flips their <span class="faction-${token.faction}">${token.name}</span> token in the ${token.location} face down` );
    }


    incrementEventCardTracker( event ){
        console.log("incrementEventCardTracker", event);
        if(event.card.type === "event") this.data.eventCardsPlayed++;
    }

    checkKilledChampion( unit, options ){
        if(!_.isChampion( unit ) || this.data.hasKilledChampion){
            return;
        }

        this.data.hasKilledChampion = true;
        this.drawCards( 2, true );
        this.message("draws two cards for assassinating an enemy champion");
    }

    surveyorOnBeforeAttack( args, victim ) {
        let championsInArea = victim.unitsInArea( args.area, { isChampion: true } );
        console.log("championsInArea", championsInArea);

        if (!championsInArea.length ) return;

        args.attacks.push(3);
        args.seeking = true;
    }

    /**
     * Can we activate our intel token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateIntel( token, area ) {
        // are there any enemy basic unit in this area?
        return this.hasEnemyUnitsInArea( area, { basic : true });
    }

    /**
     * Handle activating our intel token
     *
     * @param args
     */
    async activateIntelToken( args ) {
        let area = args.area;
        let enemyTypesCount = this.enemyTypesInArea( area, { basic : true } ).length;

        args.fromToken = true;

        // draw our intel cards
        let cards = this.drawIntelCards( area, enemyTypesCount );
        let done = false;

        while(done === false){
            let response = await this.chooseIntelCard( area, cards );

            let cardId = response.selected;

            // if we decline then conclude the loop
            if( !cardId ){
                done = true;
                this.game().message( 'declines to play an event card' );
                continue;
            }

            // prepare our data, then resolve our action card
            //args.area = this.game().areas[args.area];
            response.cardId = cardId;
            response.cost = this.game().objectMap[ cardId ].cost;
            await this.resolveCard( args, response );

            this.data.eventCardsPlayed++;

            // remove it from our cards array
            cards = cards.filter( item => item.id !== cardId );

            if( !cards.length ) done = true;
        }

        // discard unselected cards (if any)
        if( cards.length ) this.discardCards( cards.map( item => item.id ) );

        this.game().advancePlayer();
    }

    /**
     *
     *
     */
    async chooseIntelCard( area, cards ){
        let args = {
            area : area.name,
            cards : cards,
            type : "event",
            message : "Choose an event card to play",
        };

        // allow player to select a valid card (if any)
        return await this.prompt( 'choose-action-card', args );
    }


    /**
     * Draw cards to be revealed to our magick ability
     *
     * @returns {array}
     */
    drawIntelCards( area, count ){
        // draw cards equal to our count then remove them from our hand because we
        // don't actually want to treat them as regularly drawn cards
        this.drawCards( count );
        let cards = this.data.cards.hand.slice( -count );

        // reveal the cards to all players
        this.game().message({
            faction : this,
            message: `use intel in the <span class="highlight">${area.name}</span> revealing:`,
            type : 'cards',
            cards : cards,
        });

        return cards;
    }


    /**
     * Flip a unit to their skeleton side
     *
     * @param unit
     */
    becomeAgent( unit ) {
        unit.killed = null;
        unit.flipped = true;
        unit.canDeployFlipped = "becomeAgent";
        unit.influence = 2;
    }

    /**
     * Revert a flipped unit to its face up side
     *
     * @param unit
     */
    unflipUnit( unit ) {
        unit.flipped = false;

        if( unit.type === 'patsy' ){
            unit.influence = 0;
            unit.canDeployFlipped = false;
        }
    }

    resetTrackers(){
        this.data.hasKilledChampion = false;
        this.data.eventCardsPlayed = 0;
        this.data.currentWoundAgentActions = 0;
    }

    async surveyorDragToken( event ){
        let unit = event.unit;
        let area = this.game().areas[unit.location];

        // get adjacent areas with valid tokens to move
        let areasWithValidTokens = this.getTokenMoveAreas( area );
        let tokensInCurrentArea = this.tokensInArea( area );

        // if we don't have any valid tokens to move abort
        if( !areasWithValidTokens.length || !tokensInCurrentArea.length ) return this.message("No valid tokens for the Surveyor to move or discard" );

        // player optionally chooses a token to move
        let fromResponse = await this.prompt( 'choose-tokens', {
            count : 1,
            areas : areasWithValidTokens,
            optional : true,
            playerOnly : true,
            message : `Have The Surveyor move a token to the ${area.name}?`
        });

        // if we didn't choose a token, abort
        if( !fromResponse.tokens ) return this.message( `Declines to move a token to the ${area.name}` );

        // player optionally chooses a token to move
        let toResponse = await this.prompt( 'choose-tokens', {
            count : 1,
            areas : [area.name],
            optional : true,
            playerOnly : true,
            message : `Choose a token to discard in the ${area.name}`
        });

        // if we didn't choose a token, abort
        if( !toResponse.tokens ) return this.message( `Declines to move a token to the ${area.name}` );

        // resolve our token drag
        this.resolveTokenMove( fromResponse, toResponse, area );
    }


    /**
     * Resolve moving a token from XerZhul entering an area
     *
     * @param from
     * @param to
     * @param toArea
     */
     resolveTokenMove( from, to, toArea ){
        // move token
        let fromToken = this.game().objectMap[ from.tokens[0] ] ;
        let toToken = this.game().objectMap[ to.tokens[0] ] ;

        // remove from old area
        let fromArea = this.game().areas[fromToken.location];
        _.discardToken( fromToken, fromArea );
        _.discardToken( toToken, toArea, fromToken );

        //move to new area
        this.message( `The Surveyor moves a token from The ${fromArea.name} to the ${area.name}` );
    }

    /**
     * Returns a list of areas that are adjacent to the given area, and where we have tokens
     *
     * @param toArea
     * @returns {[]}
     */
     getTokenMoveAreas( toArea ){
        let areas = [];

        Object.values( this.game().data.areas ).forEach( area => {
            if( toArea.data.adjacent.includes( area.name )
                && area.tokens.find( token => token.faction === this.name ) ) areas.push( area.name );
        });

        return areas;
    }


    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {
        mods.push({
            type: 'patsyAgent',
            text: `Wounded patsies gain xIxxIx`
        });

        mods.push({
            type: 'surveyorBonus',
            text: `the Surveyor gains +1 attack die and seeking when attacking a player with a champion here`
        });
        return mods;
    }


}


module.exports = Agency;
