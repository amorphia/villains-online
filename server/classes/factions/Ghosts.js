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
        this.data.hiddenReserves = true;

        // tokens
        this.tokens['scare'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'scare',
                cost: 0,
                resource : 1,
                areaStat : true,
                description : 'enemy tokens produce no influence here'
            }
        };

        // units
        this.units['goon'].count = 6;
        this.units['goon'].data.ghost = false;
        this.units['mole'].count = 6;
        this.units['mole'].data.ghost = false;
        this.units['talent'].count = 4;
        this.units['talent'].data.ghost = false;
        this.units['patsy'].data.ghost = false;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "King Elliot",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [5],
                cost: 0,
                killed: false,
                selected: false,
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
                    count: 21,
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

        let king = units.find( unit => unit.type === 'champion' && unit.area === area.name );
        await this.kingMaterialized( king, area );
    }


    async kingMaterialized( king, area ){
        let enemyPatsiesInArea = [];

        Object.values( this.game().data.factions ).forEach( faction => {
            if( faction.name === this.name ) return;
            let patsiesBounced = 0;

            faction.units.forEach( unit => {
                if( unit.type === 'patsy' && _.unitInArea( unit, area.name ) && patsiesBounced < 4 ){
                    unit.location = null;
                    enemyPatsiesInArea.push( unit );
                    patsiesBounced++;
                }
            });
        });

        if( !enemyPatsiesInArea.length ) return this.game().message({ message: `Mad King Elliot couldn't find anyone to scare in The ${area.name}`, class : 'warning' });

        this.game().clearAllPlayerPrompts();
        await this.game().updateAll();

        await this.game().timedPrompt('units-shifted', {
            message : `Mad King Elliot scares patsies out of The ${area.name}`,
            units: enemyPatsiesInArea,
            area : area.name,
        });
    }

    canActivateScare() {
        return true;
    }

    scareToken( args ) {
        this.game().advancePlayer();
    }

    factionCleanUp(){
        let faceUpKing = this.data.units.find( unit => unit.type === 'champion' && _.unitInPlay( unit ) );
        if( !faceUpKing ) return;

        faceUpKing.location = null;
        this.game().message({ message: 'Mad King Elliot dematerializes into the ether', faction : this });
    }

}


module.exports = Ghosts;
