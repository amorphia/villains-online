

class Faction {

    endOfTurn = [];
    gameId;
    playerId;

    data = {
        owner : null,
        message : '',
        rolls : [],

        // progress
        ap : 0,
        pp : 0,
        upgrade : 0,
        captured : {
            current : 0,
            max : null // set by constructor
        },

        // core stats
        deployLimit : 2,
        cardLimit: 1,
        planLimit : 3,
        cardDraw : 3,

        // money
        resources : 0,
        energy : 0,
        maxEnergy : 9,
        tokenCost : 1,

        // combat
        attackBonus : 0,
        defenseBonus : 0,
        bonusDice : 0,

        // area stuff
        anyOrderPlans : false,
        capitolTokens : [],
        spyAll : false,
        usedSkills : [],
        tokenSpy : [],
        areasCapturedThisTurn : [],

        // objects
        plans : {
            current : [],
            deck : [],
            completed : [],
        },
        objective : {
            card : null,
            tests : {}
        },
        units : [],
        tokens : [],
        cards : {
            hand : [],
            active : [],
            target : [],
        }
    };

    capturedRewards = [
        { ap : 1, maxEnergy : 1 },
        { ap : 1, cardDraw : 1 },
        { ap : 1 },
        { ap : 2 },
    ];

    tokens = {
        deploy : {
            count : 3,
            data : {
                influence: 1,
                cost : 0,
                req : "This token must be discarded if you don't deploy any units"
            }
        },
        card : {
            count : 3,
            data : {
                influence: 1,
                cost : 0,
                req : "This token must be discarded if you don't play a card"
            }
        },
        move : {
            count : 1,
            data : {
                influence: 1,
                cost : 2,
                req : "This token must be discarded if you don't move any units"
            }
        },
        battle : {
            count : 1,
            data : {
                influence: 1,
                resource: 1,
                cost : 0,
                req : "This token must be discarded if you cannot start a battle"
            }
        },
    } ;

    units  = {
        goon : {
            count: 5,
            data : {
                name : 'Goon',
                influence : 1,
                basic : true,
                killed : false,
                type : 'goon',
                attack : [ 5, 5 ],
                cost : 2,
                selected : false,
                hitsAssigned : 0
            }
        },
        mole : {
            count: 5,
            data : {
                name : 'Mole',
                influence : 2,
                basic : true,
                type : 'mole',
                killed : false,
                attack : [ 9 ],
                cost : 1,
                selected : false,
                hitsAssigned : 0
            }
        },
        talent : {
            count: 3,
            data : {
                name : 'Talent',
                ready : false,
                influence : 1,
                skilled : true,
                basic : true,
                killed : false,
                type : 'talent',
                attack : [ 7 ],
                cost : 1,
                selected : false,
                hitsAssigned : 0
            }
        },
        patsy : {
            count : 4,
            data : {
                name : 'Patsy',
                ready : false,
                influence : 0,
                skilled : false,
                basic : true,
                type : 'patsy',
                killed : false,
                attack : [],
                cost : 0,
                selected : false,
                hitsAssigned : 0
            }
        },
        champion : {}
    };

    shouldSetUnitBaseStats = null;

    constructor( playerId, game ) {
        this.playerId = playerId;
        this.gameId = game.id;
        this.data.owner = playerId;
        this.data.captured.max = this.capturedRewards.length;

        // set dice rolls tracker values
        for( let i=1; i <= 10; i++ ){
            this.data.rolls[i] = 0;
        }

        if( this.game().godMode && this.game().localServer ) this.godMode();

    }

    godMode(){
        console.log( 'god mode enabled' );
        this.data.cardDraw = 10;
        this.data.planLimit = 8;
        this.data.maxEnergy = 30;
    }

    // abstract
    processUpgrade(){}
    factionCleanUp(){}
    factionCombatMods( mods ){ return mods }
    onStartOfTurn(){}
    onAfterReveal(){}
    onControlArea(){}
    onBeforeBattle(){}
    onAfterBattle(){}
    onAfterActivateToken(){}
    onAfterCombatStep(){}
    onAfterSkill(){}
    onBeforeSkill(){}
    battleOrderSort(){}
    onKillUnit(){}

    startOfTurnPrompt() {
        return 'choose-target';
    }

    playerName(){
        let player = this.game().getPlayerByFaction( this.name );
        return player.data.name;
    }

    sound( sound, options ){
        this.game().sound( sound, options );
    }

    message( args ){
        this.game().message( args );
    }

    messagePlayer( message ){
        this.game().messagePlayer( this.playerId, message );
    }

    async cleanUp(){

        // reset tokens
        this.data.tokens.forEach( token => {
            if( token.location !== 'xavier' ) token.location = null;
            token.revealed = false;
        });

        // remove active cards
        this.data.cards.active.forEach( card => {
            this.game().cards[card.class].clear( this );
            card.owner = null;
            card.playedIn = null;
        });

        let cards = this.data.cards.active.splice( 0 );
        cards.forEach( card => this.game().deck.discard.push( card ) );


        // discard target
        _.moveItemById(
            this.data.cards.target[0].id,
            this.data.cards.target,
            this.game().deck.discard
        );

        // reset used skills
        this.data.usedSkills = [];

        // reset token spy
        this.data.tokenSpy = [];

        // clear objective tests
        this.data.objective.tests = {};

        // faction specific end of turn shizz
        try {
            await this.factionCleanUp();
        } catch( error ){
            console.error( error );
        }

        // reset dead units
        this.cleanUpKilled();

        // clear captured this turn
        this.data.areasCapturedThisTurn = [];
    }

    cleanUpKilled(){
        this.data.units.forEach( unit => {
            if( unit.killed ) this.returnUnitToReserves( unit );
        });
    }


    resetEnergy(){
        this.data.energy = this.data.maxEnergy;
    }

    drawPlans(){
        let toDraw = this.data.planLimit - this.data.plans.current.length;
        for( let i = 0; i < toDraw; i++ ){
            this.drawPlan();
        }
    }


    drawPlan(){
        let plan = this.data.plans.deck.shift();
        if( plan ) this.data.plans.current.push( plan );
    }

    drawTurnCards(){
        let cardsToDraw = this.data.cardDraw;

        // if we are the last player in a 5 player game then draw an extra card
        if( this.game().data.turn === 1
         && this.game().data.playerOrder[4] === this.playerId
        ){
            this.game().message({ faction : this, message: 'Draws an extra card for going last in a 5 player game' });
            cardsToDraw++;
        }

        this.drawCards( cardsToDraw );
    }

    drawCards( n = 1, messagePlayer ){
        for( let i = 0; i < n; i++ ){
            this.data.cards.hand.push( this.game().drawCard() );
        }
        let text = `Draw ${ n } card${ n > 1 ? 's' : ''}`;
        this.message({
            message : text,
            faction : this
        });

        if( messagePlayer ){
            let newCards = this.data.cards.hand.slice( -n );
            this.messagePlayer({
                message : 'You drew the following',
                type : 'cards',
                cards : newCards
            });
        }
    }

    unflipUnit( unit ){
        unit.flipped = false;
    }

    async replaceUnit( unit, options = {} ){
        let units = [];

        if( typeof unit === 'string' ) unit = this.game().objectMap[ unit ];
        let replacement = this.data.units.find(
                item => !item.location
                && item.type === unit.type
                && !item.killed
        );

        if( !replacement ) {
            this.game().message({ faction : this, message: "Unable to replace unit", class : 'warning' });
            return false;
        }


        // replace unit
        replacement.location = unit.location;
        // if original was ready, replacement is too
        if( unit.ready ) replacement.ready = true;

        // prepare data for popup prompt
        units.push( replacement );
        units.push( _.clone( unit ) );

        // return original to owner
        let owner = this.game().factions[unit.faction];
        owner.returnUnitToReserves( unit );

        await this.game().timedPrompt('units-shifted', {
            message : options.message,
            units: units.reverse()
        });

        return true;
    }

    discardCard( cards ){
        if( !Array.isArray( cards ) ) cards = [cards];

        cards = cards.map( card => {
            return typeof card === 'string' ? this.game().objectMap[card] : card;
        });

        console.log( 'cards', cards );

        for( let card of cards ) {
            _.moveItemById(
                card.id,
                this.data.cards.hand,
                this.game().deck.discard
            );
        }

        let message = `discards cards`;
        this.game().message({
            faction : this,
            message: message,
            type: 'cards',
            cards: cards
        });
    }


    gainAP( n = 1, options = {} ){
        this.data.ap += n;

        let message = n > 0 ? 'gain' : 'lose';
        message += ` xAP${Math.abs(n)}x`;

        this.message({
            message : message,
            faction : this
        });
    }

    gainPP( n = 1, options = {}  ){
        this.data.pp += n;

        let message = n > 0 ? 'gain' : 'lose';
        message += ` xPP${Math.abs(n)}x`;

        this.message({
            message : message,
            faction : this
        });
    }

    payCost( n, announce = false, type = null ){
        if( !n ) return;

        let message = `Pay xC${n}x`;

        if( this.data.darkEnergy && type === 'card' ){
            if( this.data.darkEnergy >= n ){
                this.data.darkEnergy -= n;
                n = 0;
            } else {
                n -= this.data.darkEnergy;
                this.data.darkEnergy = 0;
            }
        }

        if( this.data.energy >= n ){
            this.data.energy -= n;
        } else {
            n -= this.data.energy;
            this.data.energy = 0;
            this.data.resources -= n;
            if( this.data.resources < 0 ){
                this.data.resources = 0;
            }
        }

        if( announce ) this.game().message({
            message: message,
            faction : this
        });
    }

    collectUpgrades(){
        let maxPoints = Math.max( this.data.ap, this.data.pp );
        let newUpgrade;

        if( maxPoints >= this.game().data.upgradePoints[0] && this.data.upgrade < 1 ) {
            this.data.upgrade = 1;
            newUpgrade = 1;
        }

        if( maxPoints >= this.game().data.upgradePoints[1] && this.data.upgrade < 2 ){
            this.data.upgrade = 2;
            newUpgrade = 2;
        }

        if( newUpgrade ){
            this.processUpgrade( newUpgrade );
            return {
                faction : this.name,
                upgrade: newUpgrade
            };
        }

    }

    readySkilledUnits() {
        if( this.controlsArea( 'university' ) ) this.game().message({
            message: `patsies have become readied`,
            faction : this
        });

        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit ) && unit.skilled ) unit.ready = true;
            if( !unit.skilled && unit.ready ) unit.ready = false;
        });
    }


    gainResources( n ){
        this.data.resources += n;
        let message = '';
        for( let i = 0; i < n; i++ ){
            message += 'xRx';
        }
        message = 'Gain ' + message;
        this.game().sound('coin', { player: this.playerId} );
        this.game().message({ message: message, faction : this });
    }

    returnUnitToReserves( unit ){
        // when calling this directly from an event we need to get the unit from the event data
        if( unit.unit ) unit = unit.unit;

        // remove from combat if needed
        if( this.game().combat ) this.game().combat.removeUnitFromCombat( unit );

        unit.killed = null;
        unit.location = null;
        if( unit.ready ) unit.ready = false;
        if( unit.flipped ) this.unflipUnit( unit );
    }



    applyCapturedRewards(){
        let rewards = this.capturedRewards[ this.data.captured.current - 1 ];
        _.forEach( rewards, (value, prop ) => {
            if( prop === 'ap' ){
                this.gainAP( value );
            } else if( prop === 'pp' ){
                this.gainPP( value );
            } else {
                this.data[prop] += value;
            }
        });
        return rewards;
    }


    captureEnemyMarker( area ){
        this.data.areasCapturedThisTurn.push( area.name );

        if( area.data.owner
            && area.data.owner !== this.name
            && this.data.captured.current < this.data.captured.max
        ){
            this.data.captured.current++;
            return this.applyCapturedRewards();
        }
    }


    collectResources(){
        this.gainResources( this.resourcesToCollect() );
    }

    gainControlOfArea( area ){
        area.data.owner = this.name;
        area.takeControl( this );
    }

    loseControlOfArea( area ){
        area.data.owner = null;
        area.loseControl( this );
    }

    testPlans(){
        let results = [];
        this.data.plans.current.forEach( plan => {
            let planResults = this.game().planTester.test( this, plan );
            results.push( planResults );
        });
        return results;
    }


    upgradeVariableTokens( upgrade, tokenCache ){
        let tokensToAdd = _.min( [ upgrade, tokenCache.length ] );
        while( tokensToAdd ){
            this.data.tokens.push( tokenCache.pop() );
            tokensToAdd--;
        }
    }


    setupVariableTokens( tokenName, tokenCache ){
        let numToSetAside = 2 - this.data.upgrade;

        if( numToSetAside > tokenCache.length ){
            while( numToSetAside > tokenCache.length ){
                console.log( 'first loop' );
                let token = this.data.tokens.find( obj => obj.type === tokenName && !obj.location && !obj.revealed );
                if( token ) _.moveItemById( token.id, this.data.tokens, tokenCache );
            }
        } else if( numToSetAside < tokenCache.length ){
            while( numToSetAside < tokenCache.length ) {
                console.log( 'second loop' );
                this.data.tokens.push( tokenCache.pop() );
            }
        }
    }

}


/**
 *
 *  Mixins
 *
 */
Object.assign( Faction.prototype, require( "./mixins/setup" ) );
Object.assign( Faction.prototype, require( "./mixins/valueMethods" ) );
Object.assign( Faction.prototype, require( "./mixins/playsTokens" ) );
Object.assign( Faction.prototype, require( "./mixins/deploysUnits" ) );
Object.assign( Faction.prototype, require( "./mixins/playsCards" ) );
Object.assign( Faction.prototype, require( "./mixins/movesUnits" ) );
Object.assign( Faction.prototype, require( "./mixins/attacksWithUnits" ) );
Object.assign( Faction.prototype, require( "./mixins/triggeredEvents" ) );
Object.assign( Faction.prototype, require( "./mixins/activatesSkills" ) );

module.exports = Faction;
