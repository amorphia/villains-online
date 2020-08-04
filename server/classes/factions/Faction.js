

class Faction {

    endOfTurn = [];
    gameId;
    playerId;

    data = {
        owner : null,
        message : '',

        // progress
        ap : 0,
        pp : 0,
        upgrade : 0,
        captured : {
            current : 0,
            max : 3
        },

        // core stats
        deployLimit : 2,
        cardDraw : 30,
        planLimit : 8,

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
        tokenSpy : null,


        // objects
        plans : {
            current : [],
            deck : [],
            completed : [],
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
        { ap : 2 },
    ];

    tokens = {
        deploy : {
            count : 3,
            data : {
                influence: 1,
                cost : 0
            }
        },
        card : {
            count : 3,
            data : {
                influence: 1,
                cost : 0
            }
        },
        move : {
            count : 1,
            data : {
                influence: 1,
                cost : 2
            }
        },
        battle : {
            count : 1,
            data : {
                influence: 1,
                resource: 1,
                cost : 0
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

    constructor( playerId, game ) {
        this.playerId = playerId;
        this.gameId = game.id;
        this.data.owner = playerId;
    }


    // abstract
    processUpgrade(){}
    factionCleanUp(){}
    factionCombatMods( mods ){ return mods }
    unitUnflipped( unit ){}
    afterCombatStep(){}
    startOfTurn(){}
    onAfterReveal(){}
    onAfterBattle(){}

    startOfTurnPrompt() {
        return 'choose-target';
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
            token.location = null;
            token.revealed = false;
        });

        // remove active cards
        this.data.cards.active.forEach( card => {
            this.game().cards[card.class].clear( this );
            _.moveItemById(
                card.id,
                this.data.cards.active,
                this.game().deck.discard
            );
        });


        // discard target
        _.moveItemById(
            this.data.cards.target[0].id,
            this.data.cards.target,
            this.game().deck.discard
        );

        // reset dead units
        this.data.units.forEach( unit => {
            if( unit.killed ){
                unit.killed = null;
                unit.location = null;
            }
        });

        // reset used skills
        this.data.usedSkills = [];

        // reset token spy
        this.data.tokenSpy = false;

        // faction specific end of turn shizz
        await this.factionCleanUp();
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
        this.drawCards( this.data.cardDraw );
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



    replaceUnit( unit ){
        if( typeof unit === 'string' ) unit = this.game().objectMap[ unit ];
        let replacement = this.data.units.find(
            item => !item.location
                && item.type === unit.type
                && !item.killed
        );

        // replace unit
        replacement.location = unit.location;
        if( unit.ready ) {
            unit.ready = false;
            replacement.ready = true;
        }

        // remove replaced unit
        unit.location = null;
        if( unit.flipped ) unit.flipped = false;

        if( this.game().combat ){
            this.game().combat.removeUnitFromCombat( unit );
        }
    }

    discardCard( card ){
        if( typeof card === 'string' ) card = this.game().objectMap[card];

        let message = `discard <span class="highlight">${card.name}</span>`;
        this.game().message({
            faction : this,
            message: message,
            type: 'cards',
            cards: [card]
        });

        _.moveItemById(
            card.id,
            this.data.cards.hand,
            this.game().deck.discard
        );
    }


    gainAP( n = 1, options = {} ){
        this.data.ap += n;
        if( options.message ) this.message({
            message : `gain xAP${n}x`,
            faction : this
        });
    }

    gainPP( n = 1, options = {}  ){
        this.data.pp += n;
        if( options.message ) this.message({
            message : `gain xPP${n}x`,
            faction : this
        });
    }

    payCost( n, announce = false ){
        if( !n ) return;

        let message = `Pay xC${n}x`;
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

        if( maxPoints >= 4 && this.data.upgrade < 1 ) {
            this.data.upgrade = 1;
            newUpgrade = 1;
        }

        if( maxPoints >= 7 && this.data.upgrade < 2 ){
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
        let controlsUniversity = this.controlsArea( 'university' );
        if( controlsUniversity ) this.game().message({
            message: `patsies have become readied`,
            faction : this
        });

        this.data.units.forEach( unit => {
            if( unit.skilled ) unit.ready = true;

            if( controlsUniversity && unit.type === 'patsy' ){
                unit.ready = true;
            }
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

    // used in onKilledEvents
    returnUnitToReserves( event ){
        event.unit.location = null;
        event.unit.killed = null;
    }

    applyCapturedRewards(){
        let rewards = this.capturedRewards[ this.data.captured.current - 1 ];
        _.forEach( rewards, (value, prop ) => {
            if( prop === 'ap' ){
                this.gainAP( value );
            } else {
                this.data[prop] += value;
            }
        });
        return rewards;
    }


    captureEnemyMarker( area ){
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

}


/**
 *
 *  Mixins
 *
 */
Object.assign( Faction.prototype, require( "../factionMixins/setup" ) );
Object.assign( Faction.prototype, require( "../factionMixins/propertyMethods" ) );
Object.assign( Faction.prototype, require( "../factionMixins/playsTokens" ) );
Object.assign( Faction.prototype, require( "../factionMixins/deploysUnits" ) );
Object.assign( Faction.prototype, require( "../factionMixins/playsCards" ) );
Object.assign( Faction.prototype, require( "../factionMixins/movesUnits" ) );
Object.assign( Faction.prototype, require( "../factionMixins/battles" ) );
Object.assign( Faction.prototype, require( "../factionMixins/triggeredEvents" ) );
Object.assign( Faction.prototype, require( "../factionMixins/activatesSkills" ) );

module.exports = Faction;
