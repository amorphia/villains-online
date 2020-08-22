
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

    hasCard( cardClass ){
        return !! this.data.cards.find( card => card.class === cardClass );
    }

    getDeployableAdjacentAreas(){
        return this.data.adjacent.map( areaName => {
            let area = this.game().areas[areaName];
            return area.hasCard( 'suitcase-nuke' ) ? false : area.name;
        }).filter( area => area );
    }

    determineControl(){
        let newControllerName;
        let influences = this.eachInfluenceHere();

        if( this.data.cards.find( card => card.class === 'suitcase-nuke' )){ // nuked areas can't be controlled
            newControllerName = null;
        } else if( this.herMajestyInArea() ){ // Queen trumps everything else
            newControllerName = 'loyalists';
        } else { // otherwise whomever has the most influence gets its
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

module.exports = Area;
