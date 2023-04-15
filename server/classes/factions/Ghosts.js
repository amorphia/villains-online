let Faction = require( './Faction' );


class Ghosts extends Faction {
    name = 'ghosts';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.maxEnergy = 8;
        this.data.name = this.name;
        this.data.title = "The Lost Legion";
        this.data.focusDescription = "Retain areas you control";
        this.data.canPlaceGhostsDuringTokens = true;
        this.data.flipableUnits = ['spirit','banshee','geist'];
        this.data.addUpgradeToControlInfluence = true;
        this.data.controlNeutralSetupArea = true;

        this.triggers = {
            "onCleanUp" : "returnGhosts",
        };

        this.shouldSetUnitBaseStats = {
            basic : false,
            props : ['attack', 'influence']
        };

        this.units['mad-king'] = {
            count: 1,
            data: {
                name: "King Elliot",
                type: 'mad-king',
                isChampion: true,
                basic: false,
                attack: [],
                influence: 1,
                noDeploy: true,
                noMove: true,
                killed: false,
                flipped: false,
                selected: false,
                blockEnemyTokenInfluence: true,
                hitsAssigned: 0,
                onUnflip: 'placeHerald',
                ghost : true,
                description: "Enemy tokens don't produce xIx in this area, Rule: When revealed place your herald in this or an adjacent area"
            }
        };

        this.units['herald'] = {
            count: 1,
            data: {
                name: "Herald of Mad King Eliiot",
                type: 'herald',
                basic: false,
                attack: [],
                influence: 2,
                noDeploy: true,
                noMove: true,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                returnOnCleanup: true,
            }
        };

        this.units['banshee'] = {
            count: 1,
            data: {
                name: "The Banshee",
                type: 'banshee',
                isChampion: true,
                basic: false,
                attack: [8,8],
                noDeploy: true,
                influence: 0,
                noMove: true,
                killed: false,
                flipped: false,
                selected: false,
                onUnflip: "bansheeWail",
                hitsAssigned: 0,
                ghost : true,
                bansheeCards: 2,
                description: "Wail: When revealed draw an action card, then you may play up to two action cards in this area"
            }
        };

        this.units['poltergeist'] = {
            count: 1,
            data: {
                name: "The Poltergeist",
                type: 'poltergeist',
                isChampion: true,
                basic: false,
                attack: [6,6],
                noDeploy: true,
                influence: 0,
                noMove: true,
                killed: false,
                flipped: false,
                selected: false,
                onUnflip: "scareUnits",
                hitsAssigned: 0,
                ghost : true,
                description: "Scare: When revealed return all enemy patsies in this area to their reserves and wound all units with toughness"
            }
        };
    }


    /**
     * During the start of turn select a target an random if we have to
     *
     * @returns {string}
     */
    async placeGhost( game, areaName, unitId ) {

        this.game().popup( this.playerId, { type: 'materialize', area : areaName, faction : this.name });

        const ghost = this.data.units.find( unit => unit.id === unitId );

        this.becomeGhost( ghost );
        ghost.location = areaName;

        /*
        await this.game().timedPrompt('units-shifted', {
            message : `A ghost is haunting the ${areaName}`,
            units: [ghost],
        });
        */

        // advance game
        game.data.gameAction++;
        game.advancePlayer();
    }

    async placeHerald( unit ){
        let area = this.game().areas[ unit.location ];
        let ownedAreas = this.areas();
        let areas = area.data.adjacent.filter( area => !ownedAreas.includes( area ));
        let herald = this.data.units.find(unit => unit.type === 'herald');

        // prompt player to select an area
        let response = await this.prompt( 'choose-area', {
            areas : areas,
            show: 'units',
            addOwnUnit: herald,
            message: "Choose an area to place the Herald of Mad King Elliot",
        });

        herald.location = response.area;

        await this.game().timedPrompt('units-shifted', {
            message : `The Herald of Mad King Elliot is ordered to the ${area.name}`,
            units: [herald],
        });
    }

    async bansheeWail( unit ){
        let cardsPlayed = 0;
        let declined = false;

        // draw a card
        this.drawCards(1, true);

        // play a numbers of cards up to our card limit
        while( cardsPlayed < unit.bansheeCards && !declined ) {
            let output = await this.playACard({
                area: this.game().areas[unit.location],
                player: this.game().getPlayerByFaction( this.name ),
                message: `Play a card in the ${unit.location} (${unit.bansheeCards - cardsPlayed} remaining)`
            });

            if( output?.declined ){
                declined = true;
            } else {
                cardsPlayed++;
            }
        }
    }

    async scareUnits( unit ){
        let area = unit.location;
        let units = [];

        // cycle through each player and check for patsies
        for( let faction of Object.values( this.game().factions ) ){
            if(faction.name === this.name) continue;

            faction.data.units.forEach( unit => {
                if( _.unitInArea( unit, area, { type: 'patsy' } ) ){
                    faction.returnUnitToReserves( unit );
                    units.push( unit );
                }
            });
        }

        // wound units
        let toughUnits = _.enemyUnitsInArea( this, area, this.game().factions, { isUnwounded: true } );

        toughUnits = Object.values(toughUnits).reduce((items, item) => {
            return [...items, ...item];
        }, []);

        for( let item of toughUnits ){
            item.flipped = true;
        }

        let totalUnits = [...units, ...toughUnits];

        if(!totalUnits.length){
            this.message( "No units became scared", { class : 'warning' } );
            return;
        }

        // announce what happened to all players
        await this.game().timedPrompt('units-shifted', {
            message : `Units scared in The ${area}`,
            units: totalUnits,
            area : area,
        });
    }


    async takeMaterializeAction( player, areaName ){
        // show popup
        this.game().popup( this.playerId, { type: 'materialize', area : areaName, faction : this.name });
        const ghost = this.data.units.find( unit => unit.location === areaName && unit.isChampion );

        await this.unflipUnit( ghost );

        await this.game().timedPrompt('units-shifted', {
            message: `${ghost.name} materializes in the ${ghost.location}`,
            units: [ghost],
        });

        if(ghost.onUnflip){
            await this[ghost.onUnflip]( ghost );
        }

        this.game().advancePlayer();
    }

    /**
     * Handle ghost unit deploy
     *
     * @param units
     * @param area
     * @returns {[]}

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
     */


    /**
     * Make a unit a ghost
     *
     * @param unit
     */
    becomeGhost( unit ){
        // flip the appropriate flags
        unit.flipped = true;

        if("blockEnemyTokenInfluence" in unit){
            unit.blockEnemyTokenInfluence = false;
        }

        // set stats
        unit.attack = [];
        unit.influence = 0;
    }


    /**
     * Revert a ghost unit to normal
     *
     * @param unit
     */
    async unflipUnit( unit ) {
        unit.flipped = false;
        unit.attack = [...unit.baseAttack];
        unit.influence = unit.baseInfluence;

        if("blockEnemyTokenInfluence" in unit){
            unit.blockEnemyTokenInfluence = true;
        }
    }

    returnGhosts(){
        let ghosts = this.data.units.filter( unit => (unit.ghost || unit.returnOnCleanup) && _.unitInPlay( unit ) );
        ghosts.forEach( unit => this.returnUnitToReserves( unit ) );
    }


    /**
     * Handle our Materialize action
     *
     * @param player
     * @param areaName
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
     */

    /**
     * Begin the materializing process by doing some book keeping
     *
     * @param area

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
     */

    /**
     * Resolve our materialize action
     *
     * @param response
     * @param area

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
     */

    /**
     * Can we activate our scare token?
     *
     * @param token
     * @param area
     * @returns {boolean}

    canActivateScare( token, area ) {
        // check if there are any enemy patsies in the area
        let enemyPatsies = Object.keys( this.enemyUnitsInArea( area, { type : 'patsy' } ) );

        // if so return true, otherwise false
        return !! enemyPatsies.length;
    }
     */

    /**
     * Handle our scare token activation
     *
     * @param args

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
     */

    /**
     * Handle the scaring of patsies for one faction
     *
     * @param faction
     * @param units
     * @param area

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
     */

    /**
     * Handle the response from our choose scare units prompt
     *
     * @param player
     * @param response
     * @param units

    async handleScareUnitsResponse( player, response, units ){

        // once we get a response push the selected patsies to the units array
        response.units.forEach( unitId => units.push( this.game().objectMap[unitId] ) );
        // then clear the player prompt
        player.setPrompt({ active : false, updatePlayerData : true });
    }
     */

    /**
     * Auto select our patsies, if able
     *
     * @param patsiesInArea
     * @returns {*}

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

    }
    */
}


module.exports = Ghosts;
