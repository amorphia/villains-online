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
        };

        //data
        this.data.name = this.name;
        this.data.title = "Section Seven";
        this.data.focusDescription = "Assassinate enemy champions";

        this.data.maxEnergy = 8;
        this.data.hasKilledChampion = [];
        this.data.unlockedOrders = 0;
        this.data.lastSurveyorGameAction = 0; // used to track if we are permitted to take a regular action
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
                resource: 1,
                description: "Place The Surveyor here from your reserves, or perform the action on one readied starting order.",
                req :  "Discard this token if you don’t place the surveyor or activate an order"
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
                noDeploy: true,
                flipped: false,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                toughness: true,
                seeking: false,
                onBeforeAttack: 'surveyorOnBeforeAttack',
                returnOnCleanup: true,
                //onAfterAttack: 'surveyorOnAfterAttack',
                //onDeploy: 'surveyorDragToken',
            }
        };
    }

    setupOrders( saved ){
        let orders = [
            { name: "recuperate", ready: true, unlocked: true, starting: true },
            { name: "strike", ready: true, unlocked: true, starting: true },
            { name: "reposition", ready: true, unlocked: true, starting: true },
            { name: "flush-out", ready: true, unlocked: true, starting: true, exhausts: true },

            { name: "conspire", ready: true, unlocked: false, exhausts: true },
            //{ name: "resuscitate", ready: true, unlocked: false, fromGraveyard: true },
            { name: "operation", ready: true, unlocked: false, exhausts: true },
            { name: "recruit", ready: true, unlocked: false, exhausts: true },
            { name: "disrupt", ready: true, unlocked: false, exhausts: true },
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
                canDecline: true,
                message: "Choose an order to unlock",
            });

            if( response?.decline ) return this.message( "The agency declines to issue new orders" );

            let selectedOrder = this.getOrder( response.selectedOrder );
            selectedOrder.unlocked = true;
            this.message(`Unlocks a new order`, { type: 'order', order: selectedOrder.name } );

            this.data.unlockedOrders++;
        }

        // this.data.surveyorBonusDice = upgrade;
        let unit = this.getChampion();
        unit.attack = upgrade === 1 ? [4] : [2];
    }

    getOrder( orderName ){
        return this.data.surveyorOrders.find( order => order.name === orderName );
    }

    async checkKilledChampion( unit, options ) {
        if ( unit.faction === this.name || !_.isChampion(unit) || this.data.hasKilledChampion.includes( unit.faction ) ) {
            return;
        }

        this.data.hasKilledChampion.push( unit.faction );
        this.drawCards( 1, true );
        this.refreshOrders();
        this.message("draws a card for assassinating an enemy champion");
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

    isValidOrder( surveyor, order, options = {} ){
        // is this order unlocked?
        if( !order.unlocked ) return false;

        // is this order ready?
        if( !order.ready ) return false;

        // is this order for killed surveyors only and he has not been killed?
        if( order.fromGraveyard && !surveyor.killed ) return false;

        // is this order for alive surveyors only and he has been killed?
        if( !order.fromGraveyard && surveyor.killed ) return false;

        // is the startingOnly flag set?
        if( options.startingOnly && !order.starting ) return false;

        // check the specific order requirements
        return this[this.getOrderValidMethod(order.name)]( surveyor );
    }



    async surveyorAction( options = {} ){
        let surveyor = this.getChampion();
        if( _.unitInReserves( surveyor ) ) return this.message( "The Surveyor is not in play", { class: "warning" } );

        let validOrders = this.data.surveyorOrders
            .filter( order => this.isValidOrder( surveyor, order, options ) )
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

        this.message( `The Agency orders The Surveyor to ${_.startCase(response.selectedOrder)}`, { type: 'order', order: response.selectedOrder, area: surveyor.location } );
        let actionMethod = this.getOrderActionMethod( response.selectedOrder );
        await this[actionMethod]( surveyor );

        let selectedOrder = this.getOrder( response.selectedOrder );
        if( selectedOrder.exhausts ){
            selectedOrder.ready = false;
        }
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

    canConspire( surveyor ){
        let area = this.game().areas[surveyor.location];
        return this.hasEnemyUnitsInArea( area );
    }

    async surveyorConspire( surveyor ) {
        let area = this.game().areas[surveyor.location];

        // get our target faction
        let targetFaction = await this.selectEnemyPlayerWithUnitsInArea( area, 'Choose player to conspire against' );

        // abort if we don't have any targets
        if( !targetFaction ){
            this.message( "No targets for the conspiracy", { class : 'warning' } );
            return;
        }

        // get our victim and kill it
        let unit = await this.getSacrificeVictim( targetFaction, area );

        // show our work
        this.game().message({ faction: targetFaction, message: `sacrifices <span class="faction-${unit.faction}">${unit.name}</span> in the ${area.name}` });
        await this.game().timedPrompt('units-shifted', {
            message : `The Surveyor conspires against a unit in the ${area.name}`,
            units: [unit]
        });

        await this.game().killUnit( unit, this );
    }

    async getSacrificeVictim( faction, area ) {
        // alert players
        this.game().sound( 'basta' );
        let message = `must lose a unit to a dark conspiracy`;
        this.game().message({ faction, message });

        // get our enemy units
        let enemyUnits = _.factionUnitsInArea(faction, area);

        // if there is only one enemy units just return it
        if ( enemyUnits.length === 1 ) {
            return enemyUnits[0];
        }

        // otherwise let that player choose which of their units to sacrifice
        let [player, response] = await this.game().promise({
            players: faction.playerId,
            name: 'sacrifice-units',
            data: {
                count: 1,
                areas: [area.name],
            }
        });

        return this.game().objectMap[response.units[0]];
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

    canStrike( surveyor ){
        let passedFactions = this.getPassedFactions();
        let areasWithEnemyChampions = this.areasWithEnemyUnits({ isChampion: true, notOwnedBy : passedFactions });
        let ceaseFireAreas = this.filterAreasByCeaseFire( { invert : true });

        if( ceaseFireAreas.length ){
            areasWithEnemyChampions = _.difference( areasWithEnemyChampions, ceaseFireAreas );
        }

        return areasWithEnemyChampions.includes( surveyor.location );
    }

    async surveyorStrike( surveyor ){
        // resolve attack with that unit
        let area = this.game().areas[ surveyor.location ];
        let targets = this.enemiesWithUnitsInArea( area, { isChampion: true });
        let passedFactions = this.getPassedFactions();

        await this.attack({
            area : area,
            attacks : surveyor.attack,
            targets : targets.filter(faction => !passedFactions.includes(faction)),
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
        let areas = faction.areasWithTokens( { unrevealed : true } );
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
    }

    async surveyorPlayCard( surveyor, orderName,  free = false ){
        let output = await this.playACard({
            area: this.game().areas[surveyor.location],
            player: this.game().getPlayerByFaction( this.name ),
            message: `Play a card in the ${surveyor.location}`,
            free: free,
        });
    }

    canOperation( surveyor ){
        return this.hasPlayableCard();
    }

    async surveyorOperation( surveyor ) {
        await this.surveyorPlayCard( surveyor, 'operation' );
    }

    getDisruptAreas( surveyor ){
        let areasWithReadyUnits = this.areasWithAnyPlayerUnits( { ready: true } );

        let area = this.game().areas[ surveyor.location ];
        let validAreas = [...area.data.adjacent, area.name ];

        return _.intersection( areasWithReadyUnits, validAreas );
    }

    canDisrupt( surveyor ){
        let validAreas = this.getDisruptAreas( surveyor );
        return validAreas.length > 0;
    }

    async surveyorDisrupt( surveyor ) {
        let areas = this.getDisruptAreas( surveyor );

        if( !areas.length  ){
            this.message( "No ready units to disrupt", { class: 'warning' });
            return false;
        }

        // prompt player to select a unit to attack with
        let response = await this.prompt( 'choose-units', {
            count : 1,
            areas : areas,
            readyOnly : true,
            message: "Choose a ready unit to exhaust"
        });

        let unit = this.game().objectMap[ response.units[0] ];

        if(!unit){
            this.message( "No unit selected to disrupt", { class: 'warning' });
            return false;
        }

        unit.ready = false;
        this.gainResources( 2 );

        await this.game().timedPrompt('units-shifted', {
            message : `The Surveyor disrupts a ready unit ${surveyor.location}`,
            units: [unit],
        });
    }

    /*
    canResuscitate( surveyor ){
        return surveyor.killed;
    }

    async surveyorResuscitate( surveyor ) {
        this.returnUnitToReserves( surveyor );

        let order = this.getOrder( 'resuscitate' );
        order.ready = false;
    }
    */

    canRecruit( surveyor ){
        return this.canActivateDeploy();
    }

    async surveyorRecruit( surveyor ) {
        // deploy a unit
        let output = await this.deploy({
            area: surveyor.location,
            faction: this,
            player: this.playerId,
            deployLimit: 1,
        });
    }

    surveyorOnBeforeAttack( args, victim ) {
        let championsInArea = victim.unitsInArea( args.area, { isChampion: true } );
        if ( !championsInArea.length ) return;

        args.seeking = true;

        /*
        let loops = this.data.surveyorBonusDice;
        let surveyor = this.getChampion();

        while( loops ){
            args.attacks.push(surveyor.attack[0]);
            loops--;
        }
        */
    }

    /**
     * Can we activate our intel token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateIntel( token, area ) {
        let unit = this.getChampion();
        return !unit.killed;

        // let order = this.getOrder( 'resuscitate' );
        // return !unit.killed || ( order.unlocked && order.ready );
    }

    /**
     * Handle activating our intel token
     *
     * @param args
     */
    async activateIntelToken( args ) {
        let area = args.area;
        let unit = this.getChampion();

        if( !unit.location ){
            await this.placeSurveyor( unit, area );
        } else {
            await this.surveyorAction( { startingOnly : true } );
        }

        this.game().advancePlayer();
    }

    async placeSurveyor( unit, area ){
        await this.placeUnit( unit, area.name );

        await this.game().timedPrompt('units-shifted', {
            message : `The Surveyor enters the ${area.name}`,
            units: [unit],
        });
    }

    resetTrackers(){
        this.data.hasKilledChampion = [];
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
