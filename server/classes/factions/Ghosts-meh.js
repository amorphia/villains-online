let Faction = require( './Faction' );


class GhostsMeh extends Faction {
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
        //this.data.lastMaterializeGameAction = 0;
        //this.data.randomTarget = true;
        this.data.ghostDeploy = true;
        this.data.hiddenReserves = true;
        this.data.additionalUnitIcon = ['ghost'];

        // tokens
        this.tokens['scare'] = {
            count: 2,
            data: {
                influence: 1,
                type: 'scare',
                cost: 0,
                resource : 1,
            }
        };

        // units
        this.units['goon'].count = 6;
        this.units['goon'].data.ghost = false;
        this.units['mole'].count = 6;
        this.units['mole'].data.ghost = false;
        this.units['talent'].count = 4;
        this.units['talent'].data.ghost = false;
        this.units['patsy'].count = 5;
        this.units['patsy'].data.ghost = false;

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
                selected: false,
                hitsAssigned: 0,
                ghost : false,
                areaStat : true,
                description : 'enemy tokens produce no influence here'
            }
        };
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
            output.push({ faction : 'ghosts', type : 'ghost', name : 'ghost', location : area });
        });

        return output;
    }


    becomeGhost( unit ){
        // move unit from units array to ghosts array
        if( !unit.ghost ) _.moveItemById( unit.id, this.data.units, this.data.ghosts );
        unit.ghost = true;
    }

    unGhost( unit ){
        // move unit from units array to ghosts array
        if( unit.ghost ) _.moveItemById( unit.id, this.data.ghosts, this.data.units );
        unit.ghost = false;
    }


    ghostAreas(){
        let areas = {};

        this.data.ghosts.forEach( ghost => {
            areas[ghost.location] = true;
        });

        return Object.keys( areas );
    }

    async scareToken( area ){
        let player, data, ghostAreas = this.ghostAreas();

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-units',
            data: {
                    areas : ghostAreas,
                    playerOnly : true,
                    ghostOnly : true,
                    canDecline : true,
                    payCost: true,
                    materialize : true,
                    count: 21,
                    optionalMax : true,
                    hideMax : true,
                    message: `Reveal ghosts (if you reveal ghosts in 3 or more areas pay xC1x)`
                }
            }).catch( error => console.error( error ) );

        if( data.decline ){
            return this.game().advancePlayer();
        }

        let units = data.units.map( unitId => this.game().objectMap[ unitId ] );
        let cost = data.areaCost;

        units.forEach( unit => {
            cost += unit.cost;
            this.unGhost( unit );
        });

        if( cost > 0 ) this.payCost( cost, true );

        this.game().message({ faction : this, message: `Ghosts materialize` });

        await this.game().timedPrompt('units-shifted', {
            message : `${units.length === 1 ? 'A Ghost materializes' : 'Ghosts materialize'}`,
            units: units
        });

        this.game().advancePlayer();
    }

    canActivateScare() {
        return true;
    }

}


module.exports = GhostsMeh;
