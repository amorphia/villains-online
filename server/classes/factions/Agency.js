let Faction = require( './Faction' );

class Order {
    constructor( data ) {
        Object.assign( this, data );
    }
}

class Agency extends Faction {
    name = 'agency';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onStartOfTurn" : "refreshOrders",
            "onCleanUp" : "resetTrackers",
            "onFactionKillsUnit" : "checkKilledChampion",
            "onAfterCardPlayed" : "incrementEventCardTracker",
        };

        //data
        this.data.name = this.name;
        this.data.title = "Section Seven";
        this.data.focusDescription = "Play many event cards";

        // icons
        this.data.hasKilledChampion = [];
        this.data.unlockedOrders = 0;
        this.data.maxIntelCards = 2;
        this.data.lastSurveyorGameAction = 0; // used to track if we are permitted to take a regular action
        this.data.cardLimit = 1;
        this.data.surveyorBonusDice = 0;
        this.data.eventCardsPlayed = 0;
        this.data.extraCardsOnWetwork = false;
        this.data.hiddenDiscard = [];

        this.data.surveyorOrders = [];

        this.tokens['battle'].count = 1;

        // tokens
        this.tokens['intel'] = {
            count: 2,
            data: {
                influence: 1,
                type: 'intel',
                cost: 0,
                resource: 0,
                description: "Reveal a card from the action deck for each type of basic enemy unit in this area, you may play two event cards revealed this way here (pay costs normally) and discard the rest.",
                req :  "Discard this token if no cards are revealed after activating it"
            }
        };

        this.units['champion'] = {
            count: 1,
            data: {
                name: "The Surveyor",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [6],
                cost: 0,
                flipped: false,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                toughness: true,
                seeking: false,
                onBeforeAttack: 'surveyorOnBeforeAttack',
                //onAfterAttack: 'surveyorOnAfterAttack',
                //onDeploy: 'surveyorDragToken',
            }
        };
    }

    setupOrders( saved ){
        let orders = [
            { name: "recuperate", ready: true, unlocked: true },
            { name: "assassinate", ready: true, unlocked: true },
            { name: "reposition", ready: true, unlocked: true },
            { name: "flush-out", ready: true, unlocked: true },
            { name: "conspire", ready: true, unlocked: false },
            { name: "resuscitate", ready: true, unlocked: false, fromGraveyard: true },
            { name: "black-ops", ready: true, unlocked: false },
            { name: "disrupt", ready: true, unlocked: false },
        ];

        _.forEach( orders, order => {
            let orderObj = new Order( order );
            orderObj = this.game().newObject( orderObj, saved );
            this.data.surveyorOrders.push( orderObj );
        });
    }

    /**
     * Process faction upgrade
     */
    async processUpgrade( upgrade ) {

        while ( this.data.unlockedOrders < upgrade ) {
            let validOrders = this.data.surveyorOrders.filter( order => !order.unlocked ).map( order => order.name );

            // prompt player to select an order
            let response = await this.prompt('choose-order', {
                orders: validOrders,
                message: "Choose an order to unlock",
            });

            let selectedOrder = this.getOrder( response.selectedOrder );
            selectedOrder.unlocked = true;
            this.data.unlockedOrders++;
        }

        this.data.surveyorBonusDice = upgrade;
    }

    getOrder( orderName ){
        return this.data.surveyorOrders.find( order => order.name === orderName );
    }

    incrementEventCardTracker( event ){
        if( event.card.type === "event" ) this.data.eventCardsPlayed++;
    }

    async checkKilledChampion( unit, options ) {
        if (!_.isChampion(unit) || this.data.hasKilledChampion.includes( unit.faction )) {
            return;
        }

        this.data.hasKilledChampion.push( unit.faction );
        this.drawCards( 2, true );
        this.refreshOrders();
        this.message("draws two cards for assassinating an enemy champion");
    }

    refreshOrders(){
        this.data.surveyorOrders.forEach( order => order.ready = true );
    }

    async takeSurveyorAction(){
        // record our surveyor action
        this.data.lastSurveyorGameAction = this.game().data.gameAction + 1;

        await this.surveyorAction();

        // advance to the next action, but don't advance to the next player
        this.game().advancePlayer( {}, false );
    }

    getOrderValidMethod( orderName ){
        let name = _.startCase( orderName ).replaceAll( " ", "" );
        return "can" + name;
    }

    getOrderActionMethod( orderName ){
        let name = _.startCase( orderName ).replaceAll( " ", "" );
        return "surveyor" + name;
    }

    isValidOrder( surveyor, order ){
        // is this order unlocked?
        if( !order.unlocked ) return false;

        // is this order ready?
        if( !order.ready ) return false;

        // is this order for killed surveyors only and he has not been killed?
        if( order.fromGraveyard && !surveyor.killed ) return false;

        // is this order for alive surveyors only and he has been killed?
        if( !order.fromGraveyard && surveyor.killed ) return false;

        // check the specific order requirements
        return this[this.getOrderValidMethod(order.name)]( surveyor );
    }



    async surveyorAction(){
        let surveyor = this.getChampion();
        if( _.unitInReserves( surveyor ) ) return this.message( "The Surveyor is not in play", { class: "warning" } );

        let validOrders = this.data.surveyorOrders
            .filter( order => this.isValidOrder( surveyor, order ) )
            .map( order => order.name );

        if( !validOrders.length ) return this.message("No legal Surveyor Actions", { class: "warning", silent :true  });

        // prompt player to select an order
        let response = await this.prompt( 'choose-order', {
            orders : validOrders,
            surveyor : surveyor,
            message : "Choose an order to issue to the surveyor",
            canDecline : true,
        });

        if( response?.decline ) return this.message( "The agency declines to issue orders to The Surveyor" );

        //let selectedOrder = this.getOrder( response.selectedOrder );
        this.message( `The Agency orders The Surveyor to ${_.startCase(response.selectedOrder)}` );
        let actionMethod = this.getOrderActionMethod( response.selectedOrder );
        await this[actionMethod]( surveyor );
    }

    getEnemiesWithNoUnrevealedTokens(){
        let factions = [];

        Object.values(this.game().factions).forEach(faction => {
            if( faction.areasWithTokens({ unrevealed: true }).length === 0 ) factions.push( faction.name );
        });

        return _.uniq( factions );
    }

    getFactionsWithChampionInReserves(){
        let factions = [];

        Object.values(this.game().factions).forEach(faction => {
            if( faction.unitTypesInReserves().includes("champion") ) factions.push( faction.name );
        });

        return _.uniq(factions);
    }

    canRecuperate( surveyor ){
        return surveyor.flipped;
    }

    async surveyorRecuperate( surveyor ) {
        this.unflipUnit( surveyor );
        this.message("The Surveyor shakes off his wounds");

        await this.game().timedPrompt('units-shifted', {
            message : `The Surveyor shakes off his wounds`,
            units: [surveyor],
        });
    }

    getPassedFactions(){
        let factions = [];

        Object.values( this.game().players ).forEach( player => {
           if( player.data.passed ){
               let faction = player.faction().name;
               factions.push( faction );
           }
        });

        return factions;
    }

    canAssassinate( surveyor ){
        let passedFactions = this.getPassedFactions();
        let areasWithEnemyChampions = this.areasWithEnemyUnits({ isChampion: true, notHidden: true, notOwnedBy : passedFactions });
        let ceaseFireAreas = this.filterAreasByCeaseFire( { invert : true });

        if( ceaseFireAreas.length ){
            areasWithEnemyChampions = _.difference( areasWithEnemyChampions, ceaseFireAreas );
        }

        return areasWithEnemyChampions.includes( surveyor.location );
    }

    async surveyorAssassinate( surveyor ){
        // resolve attack with that unit
        let area = this.game().areas[ surveyor.location ];

        await this.attack({
            area : area,
            attacks : surveyor.attack,
            targets : this.enemiesWithUnitsInArea( area, { isChampion: true, notHidden: true }),
            forceChooseTarget : true,
            unit : surveyor,
            noDecline : true
        });
    }

    canReposition( surveyor ){
        return true;
    }

    async surveyorReposition( surveyor ){
        this.message("The Surveyor repositions");

        let areas = this.game().areas[ surveyor.location ].data.adjacent;

        // prompt player to select an area
        let response = await this.prompt( 'choose-area', {
            areas : areas,
            show : 'units',
            addOwnUnit : surveyor,
            message : "Choose an area to place The Surveyor",
            canDecline : true,
        });

        if( response?.declined ) return this.message( "declines to reposition" );

        surveyor.location = response.area;

        await this.game().timedPrompt('units-shifted', {
            message : `The Surveyor repositions to the ${response.area.name}`,
            units: [surveyor],
        });
    }

    getValidFlushOutFactions(){
        let factionsWithChampionInReserves = this.getFactionsWithChampionInReserves();
        let enemiesWithNoUnrevealedTokens = this.getEnemiesWithNoUnrevealedTokens();
        return _.difference( factionsWithChampionInReserves, enemiesWithNoUnrevealedTokens );

        //return validFlushOutFactions;
    }

    canFlushOut( surveyor ){
        let validFlushOutFactions = this.getValidFlushOutFactions();
        return validFlushOutFactions.length > 0;
    }

    async surveyorFlushOut( surveyor ){
        let validFlushOutFactions = this.getValidFlushOutFactions();
        let response;

        // choose player
        response = await this.prompt( 'choose-players', {
            factions : validFlushOutFactions,
            count : 1,
            message: "Choose a player to place their champion in play",
            canDecline: true,
        });

        if( response?.decline ) return this.message( "declines to flush out" );

        // figure out what areas
        let faction = this.game().factions[response.factions[0]];
        let areas = faction.areasWithTokens();
        let champion = faction.getChampion( { inReserves : true } );

        // player chooses area
        response = await faction.prompt( 'choose-area', {
            areas : areas,
            show: 'units',
            addOwnUnit: champion,
            message: "Choose an area to place your champion"
        });

        // place boss
        let area = this.game().areas[ response.area ];
        await this.placeUnit( champion, area.name );

        let text = `The Surveyor has flushed the ${faction.name} champion out of hiding into the ${area.name}`;
        this.message( text );

        await this.game().timedPrompt('units-shifted', {
            message : text,
            units: [champion],
        });

        let order = this.getOrder( 'flush-out' );
        order.ready = false;
    }

    async surveyorPlayCard( surveyor, orderName,  free = false ){
        let output = await this.playACard({
            area: this.game().areas[surveyor.location],
            player: this.game().getPlayerByFaction( this.name ),
            message: `Play a card in the ${surveyor.location}`,
            free: free,
        });

        if( output?.declined ) return;

        let order = this.getOrder( orderName );
        order.ready = false;
    }

    canBlackOps( surveyor ){
        return this.hasPlayableCard();
    }

    async surveyorBlackOps( surveyor ) {
        await this.surveyorPlayCard( surveyor, 'black-ops' );
    }

    canConspire( surveyor ){
        return this.hasUnitsInArea( surveyor.location );
    }

    async surveyorConspire( surveyor ) {
        // do we want to sacrifice a unit?
        let response = await this.prompt( 'sacrifice-units', {
            count : 1,
            areas : [surveyor.location],
            optional : true
        });

        // if we didn't choose to sacrifice a unit, discard suitcase nuke and abort
        if( !response.units.length ) return this.message( "chose not to conspire against their units" );

        const unit = this.game().objectMap[response.units[0]];
        await this.game().killUnit( unit, this );
        this.gainResources( unit.cost + 1 );

        this.message( `The Surveyor conspires against a unit` );
        await this.game().timedPrompt('units-shifted', {
            message : `The Surveyor conspires against a unit`,
            units: [unit],
        });

        let order = this.getOrder( 'conspire' );
        order.ready = false;
    }

    canDisrupt( surveyor ){
        return this.readyEnemyUnitsInArea( surveyor.location ).length > 0;
    }

    async surveyorDisrupt( surveyor ) {
        let units = this.readyEnemyUnitsInArea( surveyor.location );
        units.forEach( unit => unit.ready = false );

        await this.game().timedPrompt('units-shifted', {
            message : `The Surveyor disrupts the ready enemy units in the ${surveyor.location}`,
            units: units,
        });

        let order = this.getOrder( 'disrupt' );
        order.ready = false;
    }

    canResuscitate( surveyor ){
        return surveyor.killed;
    }

    async surveyorResuscitate( surveyor ) {
        this.returnUnitToReserves( surveyor );

        let order = this.getOrder( 'resuscitate' );
        order.ready = false;
    }

    surveyorOnBeforeAttack( args, victim ) {
        let championsInArea = victim.unitsInArea( args.area, { isChampion: true } );
        if ( !championsInArea.length ) return;

        args.seeking = true;

        let loops = this.data.surveyorBonusDice;
        let surveyor = this.getChampion();

        while( loops ){
            args.attacks.push(surveyor.attack[0]);
            loops--;
        }
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
        let advance = true;
        let cardsPlayed = 0;

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

            let output = await this.resolveCard( args, response );

            if(output?.dontAdvancePlayer){
                advance = false;
            }

            this.data.eventCardsPlayed++;

            // remove it from our cards array
            cards = cards.filter( item => item.id !== cardId );
            cardsPlayed++;

            if( !cards.length || cardsPlayed === this.data.maxIntelCards ) done = true;
        }

        // discard unselected cards (if any)
        if( cards.length ) this.discardCardsToHiddenDiscard( cards );

        this.game().advancePlayer( {}, advance );
    }

    discardCardsToHiddenDiscard( cards ){
        let count = cards.length;

        // move each card from our hand to the discard pile
        for( let card of cards ) {
            _.moveItemById(
                card.id,
                this.data.cards.hand,
                this.data.hiddenDiscard,
            );
        }

        this.message(`places ${count} cards face down` );
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
        this.message(`use intel in the <span class="highlight">${area.name}</span> to draw ${count} cards`);

        return cards;
    }


    /**
     * Flip a unit to their skeleton side
     *
     * @param unit
     */
    /*
    becomeAgent( unit ) {
        unit.killed = null;
        unit.flipped = true;
        unit.canDeployFlipped = true;
        unit.influence = 2;
    }

    /**
     * Revert a flipped unit to its face up side
     *
     * @param unit

    unflipUnit( unit ) {
        unit.flipped = false;

        if( unit.type === 'patsy' ){
            unit.influence = 0;
            unit.canDeployFlipped = false;
        }
    }
     */

    resetTrackers(){
        this.data.hasKilledChampion = [];
        this.data.eventCardsPlayed = 0;
        this.data.cardLimit = 1;
        this.data.maxIntelCards = 1;
    }

    /*
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
        if( !fromResponse.tokens?.length ) return this.message( `Declines to move a token to the ${area.name}` );

        // player optionally chooses a token to move
        let toResponse = await this.prompt( 'choose-tokens', {
            count : 1,
            areas : [area.name],
            optional : true,
            playerOnly : true,
            message : `Choose a token to discard in the ${area.name}`
        });

        // if we didn't choose a token, abort
        if( !toResponse.tokens?.length ) return this.message( `Declines to move a token to the ${area.name}` );

        // resolve our token drag
        this.resolveTokenMove( fromResponse, toResponse, area );

        return { dontAdvancePlayer: true };
    }


    /**
     * Resolve moving a token from XerZhul entering an area
     *
     * @param from
     * @param to
     * @param toArea
     */
    /*
     resolveTokenMove( from, to, toArea ){
        // move token
        let fromToken = this.game().objectMap[ from.tokens[0] ] ;
        let toToken = this.game().objectMap[ to.tokens[0] ] ;

        // remove from old area
        let fromArea = this.game().areas[fromToken.location];
        _.discardToken( fromToken, fromArea );
        _.discardToken( toToken, toArea, fromToken );

        //move to new area
        this.message( `The Surveyor moves a token from The ${fromArea.name} to the ${toArea.name}` );
    }

    /**
     * Returns a list of areas that are adjacent to the given area, and where we have tokens
     *
     * @param toArea
     * @returns {[]}
     */
    /*
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
        /*
        mods.push({
            type: 'patsyAgent',
            text: `Wounded patsies gain xIxxIx`
        });
        */

        let text = this.data.surveyorBonusDice
            ? `the Surveyor gains +${this.data.surveyorBonusDice} attack die and seeking when attacking a player with a champion here`
            : `the Surveyor gains seeking when attacking a player with a champion here`

        mods.push({
            type: 'surveyorBonus',
            text: text,
        });

        return mods;
    }
}


module.exports = Agency;
