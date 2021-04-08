
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


    constructor( name, game ) {
        this.gameId = game.id;
        this.name = name;
        this.data.name = name;
    }


    /**
     * Return our game object
     *
     * @returns {Game}
     */
    game(){
        return Server.games[this.gameId];
    }


    /**
     * Clean up this area
     */
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


    /**
     * Return each faction's influence here
     *
     * @returns {object}
     */
    eachInfluenceHere(){
        return _.eachInfluenceInArea( this, this.game().data.factions );
    }


    /**
     * Returns the highest amount of influence in this area
     *
     * @param influences
     * @returns {number}
     */
    mostInfluence( influences ){
        let max = _.maxBy(influences, 'influence');
        return max ? max.influence : 0;
    }


    /**
     * Return the faction with the most influence in this area, if any
     *
     * @param influences
     * @returns {boolean}
     */
    playerWithMostInfluence( influences ){
        let max = this.mostInfluence( influences );
        let maxes = influences.filter( item => item.influence === max );
        return maxes.length === 1 ? maxes[0].faction : false;
    }


    /**
     * Is her Majesty in this area?
     *
     * @returns {boolean|*}
     */
    herMajestyInArea(){
        if( !this.game().factions['loyalists'] ) return false;
        return this.game().factions['loyalists'].championInArea( this.name );
    }


    /**
     * Has the given card been played in this area?
     *
     * @param cardClass
     * @returns {boolean}
     */
    hasCard( cardClass ){
        return this.data.cards.some( card => card.class === cardClass );
    }


    /**
     * Has the given token type been activated in this area?
     *
     * @param tokenType
     * @param option
     * @returns {boolean}
     */
    hasToken( tokenType, option = {} ){
        return this.data.tokens.some( token => token.type === tokenType && token.revealed );
    }


    /**
     * Does this area have Kau in it?
     *
     * @returns {boolean}
     */
    hasKau(){
        let aliens = this.game().factions['aliens'];
        if( aliens && this.name === aliens.data.kau.location && !aliens.data.kau.killed ) return true;
    }


    /**
     * Determine the player who controls this area
     *
     * @returns {{oldController: null, influences: *, name: *, newController: *}}
     */
    async determineControl(){

        // get each players influence here
        let influences = this.eachInfluenceHere();

        // determine our new controller
        let controllerName = this.getControllerName( influences );

        // if no faction became the new controller, but this area already has one
        // our new controller name stays the old controller
        if( !controllerName && this.data.owner ){
            controllerName = this.data.owner;
        }

        // get our current controller and old controller
        let controller = controllerName ? this.game().factions[controllerName] : null;
        let oldController = this.data.owner && this.data.owner !== 'neutral' ?
            this.game().factions[this.data.owner] : null;


        let data = {
            name : this.name,
            influences : influences,
            newController : controllerName,
            oldController : this.data.owner
        };


        // if control of this area changed from one player to another handle that transition
        if( controller && controller.name !== this.data.owner ){
            // the new owner captures the enemy marker
            data.capture = controller.captureEnemyMarker( this );

            // if the old owner isn't the neutral, the old owner loses control of the area
            if( oldController ) oldController.loseControlOfArea( this );

            // the new owner gains control of the area
            controller.gainControlOfArea( this );
        }

        // if this area is controlled
        if( controller ) {
            // set capitol marker
            data.capitolToken = this.onControl( controller );
            // handle onControlArea trigger
            if( controller.triggers.onControlArea ) await controller[controller.triggers.onControlArea]( this );
        }

        // return our data
        return data;
    }


    /**
     * Return the name of this area's new controller
     *
     * @param influences
     * @returns {string|null|boolean}
     */
    getControllerName( influences ){
        // nuked areas can't be controlled
        if( this.data.cards.find( card => card.class === 'suitcase-nuke' )){
            return null;
        }

        // The Queen trumps everything else
        if( this.herMajestyInArea() ){
            return 'loyalists';
        }

        // otherwise whomever has the most influence gets it
        if( this.data.owner !== 'neutral' || this.mostInfluence( influences ) > 1 ){
            return this.playerWithMostInfluence( influences );
        }
    }


    /**
     * Return the units in this area
     *
     * @returns {Array}
     */
    units(){
        let units = [];
        Object.values( this.game().factions ).forEach( faction => {
            let factionUnits = faction.unitsInArea( this );
            units = units.concat( factionUnits );
        });

        return units;
    }


    /**
     * Can this area host a battle?
     *
     * @returns {boolean}
     */
    canBattle(){
        // if we have a cease fire that's a big no
        if( this.hasCard( 'cease-fire' ) ) return false;

        return this.factionsWithUnits().length >= 2 // if we have at least two factions here
            && this.factionsWithUnits( { withAttack : true  }).length >= 1; // at least one of which has units that can attack
    }


    /**
     * Return the factions with units in this area
     *
     * @param options
     * @returns {[]}
     */
    factionsWithUnits( options = {} ){
        let factions = [];

        Object.values( this.game().factions ).forEach( faction => {
            if( faction.data.units.some( unit => this.unitIsValid( unit, options ) ) ){
                factions.push( faction.name );
            }
        });

        return factions;
    }


    /**
    * Does this unit count towards our factionsWithUnits method?
    *
    * @param unit
    * @param options
    * @returns {boolean}
    */
    unitIsValid( unit, options ){
        return _.unitInArea( unit, this ) && ( !options.withAttack || unit.attack.length > 0 );
    }


    /**
     * Is this area trapped?
     *
     * @param faction
     * @returns {*}
     */
    isTrapped( faction ){
        return _.areaIsTrapped( faction, this );
    }

    // Abstract methods
    takeControl( faction ){}
    onControl( faction ){}
    loseControl( faction ){}
    skill( faction ){}
}

module.exports = Area;
