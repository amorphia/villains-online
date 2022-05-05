let Faction = require( './Faction' );


class Ghosts extends Faction {
    name = 'ghosts';

    constructor(owner, game) {
        super(owner, game);

        // faction event triggers
        this.triggers = {
            "onStartOfTurn" : "setRandomTarget",
        };

        this.capturedRewards = [
            { ap : 1, cardDraw : 1 },
            { ap : 1, cardDraw : 1 },
            { ap : 1 },
            { ap : 2 },
        ];

        //data
        this.data.name = this.name;
        this.data.title = "The Lost Legion";
        this.data.focusDescription = "Control any player's Targets";
        //this.data.ghosts = []; // used to store our ghost units
        this.data.upgradeDeploy = 0;

        //this.data.lastMaterializeGameAction = 0;
        this.data.randomTarget = true; // should we choose our target randomly
        this.data.ghostDeploy = true; // do we deploy ghosts
        this.data.scarePatsiesBounced = 2; // how many patsies do we bounce with our scare token

        this.data.flipableUnits = ['goon', 'mole', 'talent', 'champion'];

        // units
        this.shouldSetUnitBaseStats = {
            props : ['attack', 'influence', 'skilled']
        };

        // tokens
        this.tokens['scare'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'scare',
                cost: 0,
                resource : 1,
                req : "The token must be discarded if you don't return any patsies to their reserves"
            }
        };

        // units
        this.units['goon'].count = 7;
        this.units['goon'].data.ghost = false;
        this.units['goon'].data.flipped = false;

        this.units['mole'].count = 7;
        this.units['mole'].data.ghost = false;
        this.units['mole'].data.flipped = false;

        this.units['talent'].count = 5;
        this.units['talent'].data.ghost = false;
        this.units['talent'].data.flipped = false;

        delete this.units['patsy'];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "King Elliot",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [4],
                cost: 1,
                killed: false,
                flipped: false,
                selected: false,
                blockEnemyTokenInfluence: true,
                hitsAssigned: 0,
                ghost : false
            }
        };
    }


    /**
     * During the start of turn select a target an random if we have to
     *
     * @returns {string}
     */
    setRandomTarget() {
        let target, card;

        if( this.data.randomTarget ){
            // sect a random card, if we select one without a target do it again until we find one with a target
            while( !target ){
                card = _.sample( this.data.cards.hand );
                target = card.target;
            }

            card.randomTarget = true;
        }

    }


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        // if we haven't upgraded our deploy yet, upgrade it by one
        if( !this.data.upgradeDeploy ){
            this.data.deployLimit++;
            this.data.upgradeDeploy = true;
        }

        // if this is our second upgrade remove our random target selecting
        if( upgrade === 2 ){
            this.data.randomTarget = false;
        }
    }


    /**
     * Handle ghost unit deploy
     *
     * @param units
     * @param area
     * @returns {[]}
     */
    deployGhosts( units, area ){
        let output = [];

        units.forEach( unitId => {
            // convert ID to object
            let unit = this.game().objectMap[unitId];

            // exhaust unit
            if( unit.ready ) unit.ready = false;

            // update unit area
            unit.location = area;

            // ghostify the unit
            this.becomeGhost( unit );
            output.push( unit );
        });

        return output;
    }


    /**
     * Make a unit a ghost
     *
     * @param unit
     */
    becomeGhost( unit ){
        // flip the appropriate flags
        unit.ghost = true;
        unit.flipped = true;

        // set stats
        unit.influence = 0;
        unit.attack = [];
        if( unit.skilled ) unit.skilled = false;
    }


    /**
     * Revert a ghost unit to normal
     *
     * @param unit
     */
    unflipUnit( unit ) {
        unit.ghost = false;
        unit.flipped = false;
        unit.attack = [...unit.baseAttack];
        unit.influence = unit.baseInfluence;
        if( unit.baseSkilled ) unit.skilled = true;
    }



    /**
     * Handle our Materialize action
     *
     * @param player
     * @param areaName
     */
    async takeMaterializeAction( player, areaName ){

        // show popup
        this.game().popup( this.playerId, { type: 'materialize', area : areaName, faction : this.name });

        let area = this.game().areas[areaName];

        // initiate our materialize
        try {
            await this.beginMaterializing( area );
        } catch( error ){
            console.error( error );
        }

        this.game().advancePlayer( {}, false  );
    }


    /**
     * Begin the materializing process by doing some book keeping
     *
     * @param area
     */
    async beginMaterializing( area ){

        // choose units to materalize
        let response = await this.prompt( 'choose-units', {
            areas : [area.name],
            playerOnly : true,
            ghostOnly : true,
            canDecline : true,
            payCost: true,
            count: 30,
            optionalMax : true,
            hideMax : true,
            message: `Reveal ghosts in The ${area.name}`
        });

        // if we change our mind then back out and unset our last materialize action
        if( response.decline ) return;

        // resolve our materialize
        await this.resolveMaterialize( response, area );
    }


    /**
     * Resolve our materialize action
     *
     * @param response
     * @param area
     */
    async resolveMaterialize( response, area ){
        // turn our unitIds into the full objects
        let units = response.units.map( unitId => this.game().objectMap[ unitId ] );
        let cost = 0;

        // for each unit un-ghost it ad add up its costs
        units.forEach( unit => {
            cost += unit.cost;
            this.unflipUnit( unit );
        });

        // pay for the units we unghosted
        if( cost > 0 ) this.payCost( cost, true );

        // show our work
        this.message( `Reveals ghosts in the ${area.name}` );
        await this.game().timedPrompt('units-shifted', {
            message : `${units.length === 1 ? 'A Ghost' : 'Ghosts'} revealed in The ${area.name}`,
            units: units
        });
    }


    /**
     * Can we activate our scare token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateScare( token, area ) {
        // check if there are any enemy patsies in the area
        let enemyPatsies = Object.keys( this.enemyUnitsInArea( area, { type : 'patsy' } ) );

        // if so return true, otherwise false
        return !! enemyPatsies.length;
    }


    /**
     * Handle our scare token activation
     *
     * @param args
     */
    async activateScareToken( args ) {
        let area = args.area;
        let promises = [];
        let units = [];

        // cycle through each player and check for patsies
        for( let faction of Object.values( this.game().factions ) ){
            // get scared units from each faction
            let response = this.handleFactionScare( faction, units, area );
            if( response ) promises.push( response );
        }

        // wait for everyone who needs to to respond
        await Promise.all( promises );


        // then cycle through the array of selected patsies and bounce them to their owner's reserves
        units.forEach( unit => {
            let owner = this.game().factions[ unit.faction ];
            owner.returnUnitToReserves( unit );
        });


        // announce what happened to all players
        await this.game().timedPrompt('units-shifted', {
            message : `Patsies scared out of The ${area.name}`,
            units: units,
            area : area.name,
        });

        // and finally advance to the next player
        this.game().advancePlayer();
    }


    /**
     * Handle the scaring of patsies for one faction
     *
     * @param faction
     * @param units
     * @param area
     */
    handleFactionScare( faction, units, area ){

        // scare doesn't effect the ghosts
        if( faction.name === this.name ) return;

        // get the current faction's patsies in this area
        let patsiesInArea = faction.unitsInArea( area, { type : 'patsy' });


        // if they have none move on
        if( ! patsiesInArea.length ) return;

        // check if we can auto select two patsies for this faction
        let patsies = this.autoSelectPatsies( patsiesInArea );


        // if we have successfully auto selected patsies then add them to the units array and return
        if( patsies?.length ){
            for( let patsy of patsies ){ units.push( patsy ) }
            return;
        }

        // if not then ask the player manually select which patsies will be bounced
        let data = {
            count : this.data.scarePatsiesBounced,
            areas : [area.name],
            playerOnly : true,
            unitTypes: ['patsy']
        };

        return this.game().promise({ players: faction.playerId, name: 'choose-units', data : data })
            .then( async ([player, response]) => { this.handleScareUnitsResponse( player, response, units ) });

    }


    /**
     * Handle the response from our choose scare units prompt
     *
     * @param player
     * @param response
     * @param units
     */
    async handleScareUnitsResponse( player, response, units ){

        // once we get a response push the selected patsies to the units array
        response.units.forEach( unitId => units.push( this.game().objectMap[unitId] ) );
        // then clear the player prompt
        player.setPrompt({ active : false, updatePlayerData : true });
    }


    /**
     * Auto select our patsies, if able
     *
     * @param patsiesInArea
     * @returns {*}
     */
    autoSelectPatsies( patsiesInArea ){
        // if the number of patsies is less than or equal to the number we need to bounce, just return them all
        if( patsiesInArea.length <= this.data.scarePatsiesBounced ) return patsiesInArea;

        /*
        HERE BE DRAGONS
        todo figure out why the following didn't let me select my patsies when I was the witches and had some flipped and some unflipped patsies in the area

        // if we have more patsies than we need to bounce, lets check if there are enough patsies without
        // anything fancy going on (like being ready, or flipped) that we can safely select and if so return enough of them
        let basicPatsies = patsiesInArea.map( unit => !unit.ready && !unit.flipped ).filter( unit => unit );
        if( basicPatsies.length >= this.data.scarePatsiesBounced ) return patsiesInArea.slice( 0, this.data.scarePatsiesBounced );
         */
    }

}


module.exports = Ghosts;
