let Faction = require( './Faction' );


class Ghosts extends Faction {
    name = 'ghosts';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Lost Legion";
        //this.data.focus = 'control-targets-focus';
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
            let unit = this.game().objectMap[unitId];

            // exhaust unit
            if( unit.ready ) unit.ready = false;

            // update unit area
            unit.location = area;

            this.becomeGhost( unit );
            output.push( unit );
        });

        return output;
    }


    becomeGhost( unit ){
        // move unit from units array to ghosts array
        if( !unit.ghost ) _.moveItemById( unit.id, this.data.units, this.data.ghosts );
        unit.ghost = true;
        unit.flipped = true;
    }

    unGhost( unit ){
        // move unit from units array to ghosts array
        if( unit.ghost ) _.moveItemById( unit.id, this.data.ghosts, this.data.units );
        unit.ghost = false;
        unit.flipped = false;
    }


    async materializeAction( area ){
        let player, data;

        this.data.lastMaterializeGameAction = this.game().data.gameAction + 1;

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

        if( data.decline ){
            this.data.lastMaterializeGameAction--;
            return;
        }

        let units = data.units.map( unitId => this.game().objectMap[ unitId ] );
        let cost = 0;

        units.forEach( unit => {
            cost += unit.cost;
            this.unGhost( unit );
        });

        if( cost > 0 ) this.payCost( cost, true );

        this.game().message({ faction : this, message: `Reveals ghosts in the ${area.name}` });

        await this.game().timedPrompt('units-shifted', {
            message : `${units.length === 1 ? 'A Ghost' : 'Ghosts'} revealed in The ${area.name}`,
            units: units
        });
    }


    canActivateScare( token, area ) {
        let enemyPatsies = Object.keys( this.enemyUnitsInArea( area, { type : 'patsy' } ) );
        return !! enemyPatsies.length;
    }


    async scareToken( args ) {
        let area = args.area;
        let promises = [];
        let units = [];
        let _this = this;

        _.forEach( this.game().factions, item => {
            let patsiesInArea = item.unitsInArea( area, { type : 'patsy' });
            let needsToChoose = this.needsToChoosePatsies( patsiesInArea );

            if( needsToChoose ){
                promises.push( _this.game().promise({
                    players: item.playerId,
                    name: 'choose-units',
                    data : { count : _this.data.scarePatsiesBounced, areas : [area.name], unitTypes: ['patsy'] }
                }).then( async ([player, data]) => {
                    for( let unitId of data.units ){
                        let unit = _this.game().objectMap[unitId];
                        units.push( unit );
                    }
                    player.setPrompt({ active : false, playerUpdate : true });
                }));
            } else if( patsiesInArea.length && patsiesInArea.length <= _this.data.scarePatsiesBounced ){
                // if we don't need to choose because the patsy count here is less than or equal to the bounce count
                patsiesInArea.forEach( unit => units.push( unit ) );
            } else if( patsiesInArea.length ) {
                // if we don't need to choose, and need to grab the first two plain patsies
                for( let i = 0; i < _this.data.scarePatsiesBounced; i++ ){
                    let patsy = patsiesInArea.find( unit => !unit.flipped && !unit.ready );
                    if( patsy ) units.push( patsy );
                }
            }
        });

        await Promise.all( promises );

        units.forEach( unit => {
            unit.location = null;
            if( unit.flipped ) unit.flipped = false;
            if( unit.ready ) unit.ready = false;
        });

        await this.game().timedPrompt('units-shifted', {
            message : `Patsies scared out of The ${area.name}`,
            units: units,
            area : area.name,
        });

        this.game().advancePlayer();
    }


    needsToChoosePatsies( patsiesInArea ){
        let basicPatsies = patsiesInArea.map( unit => !unit.ready && !unit.flipped ).filter( unit => unit );
        if( patsiesInArea.length > this.data.scarePatsiesBounced && basicPatsies.length < this.data.scarePatsiesBounced ) return true;
    }

}


module.exports = Ghosts;
