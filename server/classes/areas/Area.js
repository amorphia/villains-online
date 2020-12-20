
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
        adjacent : [],
        conquered : false
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

        // clear card owners
        this.data.cards.forEach( card => card.owner = null );

        // move cards to discard
        let cards = this.data.cards.splice( 0 );
        cards.forEach( card => this.game().deck.discard.push( card ) );

        // clear battle marker
        this.data.battle = false;
    }

    eachInfluenceHere(){
        return _.eachInfluenceInArea( this, this.game().data.factions );
    }

    mostInfluence( influences ){
        let max = _.maxBy(influences, 'influence');
        return max ? max.influence : 0;
    }

    playerWithMostInfluence( influences ){
        let max = this.mostInfluence( influences );
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

    hasCard( cardClass ){
        return !! this.data.cards.find( card => card.class === cardClass );
    }

    hasToken( tokenType, option = {} ){
        return !! this.data.tokens.find( token => token.type === tokenType && token.revealed );
    }

    getDeployableAdjacentAreas(){
        return this.data.adjacent.map( areaName => {
            let area = this.game().areas[areaName];
            return area.hasCard( 'suitcase-nuke' ) ? false : area.name;
        }).filter( area => area );
    }

    hasKau(){
        let aliens = this.game().factions['aliens'];
        if( this.name === aliens.data.kau.location ) return true;
    }

    determineControl(){
        let newControllerName;
        let influences = this.eachInfluenceHere();

        if( this.data.cards.find( card => card.class === 'suitcase-nuke' )){ // nuked areas can't be controlled
            newControllerName = null;
        } else if( this.herMajestyInArea() ){ // Queen trumps everything else
            newControllerName = 'loyalists';
        } else if( this.data.owner !== 'neutral' || this.mostInfluence( influences ) > 1 ){ // otherwise whomever has the most influence gets its
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

        if( newController ) {
            data.capitolToken = this.onControl(newController);
            newController.onControlArea( this );
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
        return this.factionsWithUnits().length >= 2 && this.factionsWithUnits( { withAttack : true  }).length >= 1;
    }

    factionsWithUnits( options = {} ){
        let factions = [];
        _.forEach( this.game().factions, faction => {
            if( faction.data.units.find( unit => _.unitInArea( unit, this ) && (!options.withAttack || unit.attack.length > 0) ) ) factions.push( faction.name );
        });

        return factions;
    }


    isTrapped( faction ){
        return _.areaIsTrapped( faction, this );
    }


    takeControl( faction ){}
    onControl( faction ){}
    loseControl( faction ){}
    skill( faction ){}
}

module.exports = Area;
