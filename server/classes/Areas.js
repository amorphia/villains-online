
class Area {

    endOfTurn = [];
    name;
    gameId;

    data = {
        tokens : [],
        cards : [],
        name : null,
        maxTokens : 5,
        control : "",
        skill : "",
        owner : null,
        battle : false,
        adjacent : []
    };

    game(){
       return Server.games[this.gameId];
    }

    constructor( name, game ) {
        this.gameId = game.id;
        this.name = name;
        this.data.name = name;
    }

    cleanUp(){
        // clear tokens
        this.data.tokens = [];

        // remove cards
        this.data.cards.forEach( card => {
            card.owner = null;
            _.moveItemById(
                card.id,
                this.data.cards,
                this.game().deck.discard
            );
        } );

        // clear battle marker
        this.data.battle = false;
    }

    eachInfluenceHere(){
        return _.eachInfluenceInArea( this, this.game().data.factions );
    }

    playerWithMostInfluence( influences ){
        let max = _.maxBy(influences, 'influence');
        if( !max ) return false;

        max = max.influence;
        let maxes = influences.filter( item => item.influence === max );
        return maxes.length === 1 ? maxes[0].faction : false;
    }

    herMajestyInArea(){
        if( !this.game().factions['loyalists'] ) return false;

        return !! this.game().factions['loyalists'].data.units.find(
            unit => unit.type === 'champion'
                    && !unit.killed
                    && unit.location === this.name
        );
    }

    determineControl(){
        let newControllerName;
        let influences = this.eachInfluenceHere();

        if( this.herMajestyInArea() ){
            newControllerName = 'loyalists';
        } else {
            newControllerName = this.playerWithMostInfluence( influences );
        }


        if( !newControllerName && this.data.owner ){
            newControllerName = this.data.owner;
        }

        let newController = newControllerName ? this.game().factions[newControllerName] : null;
        let oldController = this.data.owner && this.data.owner !== 'neutral' ?
                            this.game().factions[this.data.owner] : null;

        let data = {
            name : this.name,
            influences : influences,
            newController : newControllerName,
            oldController : this.data.owner
        };

        if( newController && newController.name !== this.data.owner ){
            data.capture = newController.captureEnemyMarker( this );
            if( oldController ) oldController.loseControlOfArea( this );
            newController.gainControlOfArea( this );
        }

        if( newController ){
            data.capitolToken = this.onControl( newController );
        }

        return data;

    }

    units(){
        let units = [];
        Object.values( this.game().factions ).forEach( faction => {
            let factionUnits = faction.unitsInArea( this );
            units = units.concat( factionUnits );
        });

        return units;
    }

    canBattle(){
        if( _.find( this.data.cards, card => card.class === 'cease-fire' ) ) return false;
        let factionsWithUnits = 0;
        let factionsWithAttackingUnits = 0;

        _.forEach( this.game().factions, faction => {
            let units = faction.data.units.filter( unit => _.unitInArea( unit, this ) );
            if( units.length > 0 ) factionsWithUnits++;
            if( _.find( units, unit => unit.attack.length > 0 ) ) factionsWithAttackingUnits++
        });

        return factionsWithUnits >= 2 && factionsWithAttackingUnits >= 1;
    }


    isTrapped( faction ){
        return _.areaIsTrapped( faction, this );
    }


    takeControl( faction ){}
    onControl( faction ){}
    loseControl( faction ){}
    skill( faction ){}

}


class Capitol extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.maxTokens = 6;
        this.data.control = "Collect this turn's Capitol Token";
        this.data.skill = "Exchange the position of two action tokens in the same area";
        this.data.adjacent = [ 'sewers', 'police', 'laboratory', 'factory', 'bank', 'university', 'subway', 'church' ];
    }

    onControl( faction ){
        let token = faction.game().capitolTokens[ this.game().data.turn - 1 ];
        faction.data.capitolTokens.push( token );
        faction.gainAP( token.ap );

        this.game().message({
            message: 'Collect',
            type : 'capitol-token',
            faction : faction,
            turn : this.game().data.turn
        });
        return token;
    }


    async skill( faction ){
        let player = {}, data = {};

        // get legal areas
        let areasWithTwoTokens = this.areasWithTwoTokens();
        if( ! areasWithTwoTokens.length  ){
            faction.game().message({
                message: "No areas with 2+ tokens to swap",
                class: 'warning'
            });
            return false;
        }

        // player chooses tokens
        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-tokens',
            data : {
                count : 2,
                areas : areasWithTwoTokens,
                sameArea : true
            }
        }).catch( error => console.error( error ) );

        // swap tokens
        let tokens = [];
        data.tokens.forEach( token => tokens.push( faction.game().objectMap[ token ] ) );
        this.swapTokens( tokens, player, faction );
    }

    areasWithTwoTokens(){
        let areasWithTwoTokens = {};
        _.forEach( this.game().data.areas, area => {
            if( area.tokens.length >= 2 ) areasWithTwoTokens[area.name] = true;
        });
        return Object.keys( areasWithTwoTokens );
    }

    swapTokens( tokens, player, faction ){

        if( tokens.length !== 2 || tokens[0].location !== tokens[1].location ){
            this.game().message({
                message: "Token count wrong, or token locations don't match",
                class: 'warning'
            });
            return;
        }

        let area = this.game().data.areas[tokens[0].location];
        let tokenZeroIndex = _.findIndex( area.tokens, token => token.id === tokens[0].id );
        let tokenOneIndex = _.findIndex( area.tokens, token => token.id === tokens[1].id );

        area.tokens[tokenZeroIndex] = tokens[1];
        area.tokens[tokenOneIndex] = tokens[0];

        this.game().message({
            faction: faction,
            message: `swaps <span class="faction-${tokens[0].faction}">the ${tokens[0].faction}</span> token with <span class="faction-${tokens[1].faction}">the ${tokens[1].faction}</span> token in the ${area.name}` });
    }

}

class Sewers extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Gain +1 Deploy Limit";
        this.data.skill = "Choose one of your units, deploy a unit of that type to that area for free";
        this.data.adjacent = [ 'capitol', 'police', 'church' ];
    }

    takeControl( faction ){
        faction.data.deployLimit++;
    }

    loseControl( faction ){
        faction.data.deployLimit--;
    }


    cloneableUnitTypes( faction, areasWithUnits ){
        // lets make a list of unit types we can deploy
        let potentialUnitTypes = {
            'goon' : 0,
            'talent' : 0,
            'patsy' : 0 ,
            'mole' : 0,
            'champion' : 0
        };

        let trappedAreas = [];
        areasWithUnits.forEach( area => {
            if( _.areaIsTrapped( faction, this.game().data.areas[area] ) ) trappedAreas.push( area );
        });

        // from our reserves
        faction.data.units.forEach( unit => {
            if( _.unitInReserves( unit ) ){
                potentialUnitTypes[unit.type] = 2;
            } else if( _.unitInPlay( unit ) && !trappedAreas.includes( unit.location ) ) {
                potentialUnitTypes[unit.type]++;
            }
        });

        let unitTypes = [];
        _.forEach( potentialUnitTypes, (val,type) => {
            if( val >= 1 ) unitTypes.push( type );
        });

        return unitTypes;
    }

    async skill( faction ){
        let player = {}, data = {};


        let areasWithUnits = faction.areasWithUnits( faction, { deployable : true } );
        if( ! areasWithUnits.length  ){
            faction.game().message({
                faction: faction,
                message: "No units in play",
                class: 'warning'
            });
            return false;
        }


        let unitTypes = this.cloneableUnitTypes( faction, areasWithUnits );
        if( !unitTypes.length ){
            faction.game().message({
                faction : faction,
                message: "No valid unit types to duplicate",
                class: 'warning'
            });
            return false;
        }


        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-units',
            data : {
                count : 1,
                areas : areasWithUnits,
                unitTypes: unitTypes,
                playerOnly : true,
                message: "Choose a unit to duplicate"
            }
        }).catch( error => console.error( error ) );
        let unit = faction.game().objectMap[ data.units[0] ];


        let args = {
            area: unit.location,
            faction: faction,
            player: faction.playerId,
            free: true,
            deployLimit: 1,
            unitTypes: [unit.type],
        };

        let output = await faction.deploy( args );
        if ( output && output.declined ){
            faction.game().message({
                faction: faction,
                message: `Can't deploy to the ${unit.location}`
            });
        }

    }
}


class Police extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You may look at each enemy target (after picking yours)";
        this.data.skill = "Make an attack with any one of your units";
        this.data.adjacent = [ 'sewers', 'capitol', 'laboratory' ];
    }

    takeControl( faction ){
        faction.data.spyAll = true;
    }

    loseControl( faction ){
        faction.data.spyAll = false;
    }


    async skill( faction ){
        let player = {}, data = {};

        // get areas with units
        let areas = faction.areasWithAttackingUnits();

        if( ! areas.length  ){
            faction.game().message({
                faction : faction,
                message: "No attacks may be made",
                class: 'warning'
            });
            return false;
        }

        // prompt player to select a unit
        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-units',
            data : {
                count : 1,
                areas : areas,
                hasAttack: true,
                playerOnly : true,
                showEnemyUnits: true,
                message: "Choose a unit to make an attack"
            }
        }).catch( error => console.error( error ) );
        let unit = faction.game().objectMap[ data.units[0] ];

        // resolve attack with that unit
        let area = this.game().areas[ unit.location ];
        await faction.attack({
            area : area,
            attacks : unit.attack,
            unit : unit
        });
    }
}



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
        await faction.processCard( args, data );
    }
}

class Factory extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Your units gain +2 to their attack rolls";
        this.data.skill = "Start a battle in any area where you have a unit";
        this.data.adjacent = [ 'laboratory', 'capitol', 'bank' ];
    }

    takeControl( faction ){
        faction.data.attackBonus += 2;
    }

    loseControl( faction ){
        faction.data.attackBonus -= 2;
    }

    async skill( faction ){
        let player = {}, data = {};

        let areasWithFactionUnits = faction.areasWithUnits();
        let areaOptions = [];

        areasWithFactionUnits.forEach( areaName => {
            let area = faction.game().areas[areaName];
            if( area.canBattle() ){
                areaOptions.push( areaName );
            }
        });

        if( !areaOptions.length ){
            faction.game().message({
                message: 'No valid areas to start a battle',
                class : 'warning'
            });
            return;
        }

        // choose from the above areas
        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-area',
            data : {
                areas : areaOptions,
                show : 'units',
                message : 'Choose an area to start a battle'
            }
        }).catch( error => console.error( error ) );
        let area = faction.game().areas[data.area];

        await faction.game().battle( area );
    }
}

class Bank extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You gain an extra xRx during the COLLECT RESOURCES step.";
        this.data.skill = "Gain xRxxRx";
        this.data.adjacent = [ 'factory', 'capitol', 'university' ];
    }

    skill( faction ){
        faction.gainResources( 2 );
    }
}


class University extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Your patsies are skilled";
        this.data.skill = "Look at each face-down action token in the area of your choice.";
        this.data.adjacent = [ 'bank', 'capitol', 'subway' ];
    }

    async skill( faction ){
        let player = {}, data = {};

        let areas = faction.game().areasWithUnrevealedTokens();

        if( ! areas.length  ){
            faction.game().message({
                faction : faction,
                message: "No areas with unrevealed tokens",
                class: 'warning'
            });
            return false;
        }

        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-area',
            data : {
                areas : areas,
                show : 'tokens',
                message : 'Choose area to spy on tokens'
            }
        }).catch( error => console.error( error ) );

        faction.data.tokenSpy = data.area;
        faction.game().message({
            faction : faction,
            message: `looks at the tokens in the ${data.area}`
        });

    }
}

class Subway extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Your MOVE tokens are not limited by adjacency";
        this.data.skill = "Deploy one unit to any area (pay costs normally).";
        this.data.adjacent = [ 'university', 'captiol', 'church' ];
    }


    async skill( faction ){

        let args = {
            faction: faction,
            player: faction.playerId,
            deployLimit: 1,
        };

        let output = await faction.deploy( args );

        if ( output && output.declined ){
            faction.game().message({
                faction : faction,
                message: `Failed to deploy`,
                class : 'warning'
            });
            return;
        }

    }
}

class Church extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You may complete your plan objectives in any order";
        this.data.skill = "Flip one of your face-up action tokens face-down";
        this.data.adjacent = [ 'sewers', 'subway', 'capitol' ];
    }

    takeControl( faction ){
        faction.data.anyOrderPlans = true;
    }

    loseControl( faction ){
        faction.data.anyOrderPlans = false;
    }

    areasWithRevealedTokens( faction ){
        let areasWithRevealedTokens = {};
        faction.data.tokens.forEach( token => {
            if( token.location
                && token.location !== 'xavier'
                && token.revealed
            ) areasWithRevealedTokens[token.location] = true;
        });
        return Object.keys( areasWithRevealedTokens );
    }

    async skill( faction ){
        let player = {}, data = {};


        let areasWithRevealedTokens = this.areasWithRevealedTokens( faction );
        if( ! areasWithRevealedTokens.length  ){
            faction.game().message({
                faction : faction,
                message: "No tokens to flip with Church skill ability",
                class: 'warning' });
            return false;
        }


        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-tokens',
            data : {
                count : 1,
                areas : areasWithRevealedTokens,
                playerOnly : true,
                revealedOnly : true
            }
        }).catch( error => console.error( error ) );

        if( !data.tokens ) return;
        let token = faction.game().objectMap[ data.tokens[0] ];
        token.revealed = false;

        faction.game().message({
            faction : faction,
            message: `flips their <span class="faction-${token.faction}">${token.name}</span> token in the ${token.location} face down`
        });
    }
}


module.exports = {
    'capitol': Capitol,
    'sewers': Sewers,
    'police': Police,
    'laboratory': Laboratory,
    'factory': Factory,
    'bank': Bank,
    'university': University,
    'subway': Subway,
    'church':  Church
};


