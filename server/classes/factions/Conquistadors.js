let Faction = require( './Faction' );


class Conquistadors extends Faction {
    name = 'conquistadors';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "Los Conquistadores";
        this.data.focus = 'areas-conquered-focus';
        this.data.maxEnergy = 8;
        this.data.bonusDeploy = {type: 'goon', count: 10};
        this.data.bonusDiceInUnconquered = 0;
        this.data.conqueredAreas = [];
        this.data.focusDescription = "Conquer many areas";

        this.capturedRewards = [
            { ap : 1, cardDraw : 1 },
            { ap : 1, cardDraw : 1 },
            { ap : 1 },
            { ap : 2 },
        ];

        // tokens
        this.tokens['move'].count = 2;

        this.tokens['pox'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'pox',
                cost: 0,
                resource: 1,
                description: 'after the combat step each player must sacrifice a unit in this area for each killed unit they have here'
            }
        };

        // units
        this.units['goon'].count = 10;
        this.units['patsy'].count = 6;
        this.units['talent'].count = 4;
        delete this.units['mole'];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Diego",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [2],
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onDeploy: 'addCombatMarker',
                onMove: 'addCombatMarker',
            }
        };
    }

    factionCombatMods(mods, area) {

        if ( !area.data.conquered  && this.data.bonusDiceInUnconquered ) {
            let existingMod = mods.find(mod => mod.type === 'bonusDice');
            if (existingMod) {
                existingMod.val += this.data.bonusDiceInUnconquered;
                existingMod.text = `Units gain  -${existingMod.val} extra dice`
            } else {
                mods.push( { type : 'bonusDice', text : `Units gain +${this.data.bonusDiceInUnconquered} extra dice`, val : this.data.bonusDiceInUnconquered });
            }
        }

        return mods;
    }

    resourcesToCollect(){
        let resources = this.data.conqueredAreas.length;
        if( this.areas().includes( 'bank' ) ) resources++;
        return resources;
    }


    onControlArea( area ){
        if( !area.data.conquered ){
            area.data.conquered = true;
            this.data.conqueredAreas.push( area.name );
            let message = `Conquers The ${area.name}`;
            this.game().message({ faction: this, message: message });
        }
    }


    processUpgrade(n) {
        this.data.bonusDiceInUnconquered = n;
    }


    canActivatePox( token, area ) {
        let enemyUnits = this.enemyUnitsInArea( area, { basic : true } );
        return Object.keys( enemyUnits ).length > 0;
    }


    async poxToken( args ) {

        let promises = [];
        let units = [];

        let message = `The Pox descends on the ${args.area.name}`;
        this.game().message({ faction: this, message: message });

        try {
            _.forEach( this.game().factions, item => {
                // only opponents are effected
                if( item.name === this.name ) return;

                // if opponent has no units skip them
                if( ! item.data.units.find( unit => _.unitInArea( unit, args.area, { basic : true } ) ) ) return;

                promises.push( this.game().promise({
                    players: item.playerId,
                    name: 'sacrifice-units',
                    data : {
                        count : 1,
                        basicOnly : true,
                        areas : [ args.area.name ]
                    }
                }).then( async ([player, data]) => {

                    let unitNames = [];
                    for( let u of data.units ){
                        let unit = this.game().objectMap[u];
                        unitNames.push( unit.name );
                        units.push( unit );
                        await this.game().killUnit( unit, this );
                    }

                    let message = `sacrifices <span class="faction-${item.name}item">${unitNames.join(', ')}</span>`;
                    this.game().message({ faction: item, message: message });
                    player.setPrompt({ active : false, playerUpdate : true });
                }));
            });


            await Promise.all( promises );

            if( units.length ){
                await this.game().timedPrompt('units-shifted', {
                    message: `The Pox killed the following units`,
                    units: units
                });
            }

        } catch( error ){
            console.error( error );
        }

        this.game().advancePlayer();
    }

    addCombatMarker(event) {
        let area = this.game().areas[event.unit.location];

        if (!area.data.battle) {
            area.data.battle = true;
            let message = `<span class="faction-conquistadors">Diego</span> adds a combat marker to The ${area.name}`;
            this.message({message: message, faction: this});
        }
    }

}




module.exports = Conquistadors;
