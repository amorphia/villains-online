let Faction = require( './Faction' );


class Ghosts extends Faction {
    name = 'ghosts';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Lost Legion";
        this.data.focus = 'control-targets-focus';
        this.data.focusDescription = "Control any player's Targets";
        this.data.ghosts = [];
        this.data.upgradeDeploy = 0;
        this.data.lastMaterializeGameAction = 0;
        this.data.randomTarget = true;
        this.data.ghostDeploy = true;
        this.data.scarePatsiesBounced = 2;
        //this.data.hiddenReserves = true;

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

        this.units['patsy'].data.ghost = false;
        this.units['patsy'].data.flipped = false;

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

    startOfTurnPrompt() {
        let target, card;

        // sect a random card, if we select one without a target do it again until we find one with a target
        while( !target ){
            card = _.sample( this.data.cards.hand );
            target = card.target;
        }

        card.randomTarget = true;
        return 'choose-target';
    }

    processUpgrade( n ){
        this.data.deployLimit += ( n - this.data.upgradeDeploy );
        this.data.upgradeDeploy = n;
    }


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


    becomeGhost( unit ){
        // move unit from units array to ghosts array
        if( !unit.ghost ) _.moveItemById( unit.id, this.data.units, this.data.ghosts );

        // flip the appropriate flags
        unit.ghost = true;
        unit.flipped = true;
    }

    unGhost( unit ){
        // move unit from units array to ghosts array
        if( unit.ghost ) _.moveItemById( unit.id, this.data.ghosts, this.data.units );

        // flip the appropriate flags
        unit.ghost = false;
        unit.flipped = false;
    }


    async materializeAction( area ){
        let player, data;

        // set the last materialize action counter (to prevent us from doing this twice in a row without taking another action)
        this.data.lastMaterializeGameAction = this.game().data.gameAction + 1;

        // choose units to materalize
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-units',
            data: {
                    areas : [area.name],
                    playerOnly : true,
                    ghostOnly : true,
                    canDecline : true,
                    payCost: true,
                    count: 30,
                    optionalMax : true,
                    hideMax : true,
                    message: `Reveal ghosts in The ${area.name}`
                }
            }).catch( error => console.error( error ) );

        // if we change our mind then back out and unset our last materialize action
        if( data.decline ){
            this.data.lastMaterializeGameAction--;
            return;
        }

        // turn our unitIds into the full objects
        let units = data.units.map( unitId => this.game().objectMap[ unitId ] );
        let cost = 0;

        // for each unit un-ghost it ad add up its costs
        units.forEach( unit => {
            cost += unit.cost;
            this.unGhost( unit );
        });

        // pay for the units we unghosted
        if( cost > 0 ) this.payCost( cost, true );

        // show our work
        this.game().message({ faction : this, message: `Reveals ghosts in the ${area.name}` });

        await this.game().timedPrompt('units-shifted', {
            message : `${units.length === 1 ? 'A Ghost' : 'Ghosts'} revealed in The ${area.name}`,
            units: units
        });
    }


    canActivateScare( token, area ) {
        // check if there are any enemy patsies in the area
        let enemyPatsies = Object.keys( this.enemyUnitsInArea( area, { type : 'patsy' } ) );

        // if so return true, otherwise false
        return !! enemyPatsies.length;
    }


    async scareToken( args ) {
        let area = args.area;
        let promises = [];
        let units = [];
        let _this = this;

        // cycle through each player and check for patsies
        _.forEach( this.game().factions, item => {
            // scare doesn't effect the ghosts
            if( item.name === _this.name ) return;

            // get the current faction's patsies in this area
            let patsiesInArea = item.unitsInArea( area, { type : 'patsy' });

            // if they have none move on
            if( ! patsiesInArea.length ) return;

            let patsies = null;

            // check if we can auto select two patsies for this faction
            patsies = this.autoSelectPatsies( patsiesInArea );

            // if we have successfully auto selected patsies then add them to the units array and return
            if( patsies ) return units = units.concat( patsies );

            // if not then ask the player manually select which patsies will be bounced
            promises.push( _this.game().promise({
                players: item.playerId,
                name: 'choose-units',
                data : {
                    count : _this.data.scarePatsiesBounced,
                    areas : [area.name],
                    playerOnly : true,
                    unitTypes: ['patsy']
                }
            }).then( async ([player, data]) => {
                // once we get a response push the selected patsies to the units array
                data.units.forEach( unitId => units.push( _this.game().objectMap[unitId] ) );
                // then clear the player prompt
                player.setPrompt({ active : false, playerUpdate : true });
            }));

        });

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
