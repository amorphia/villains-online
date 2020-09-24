let Faction = require( './Faction' );


class Guerrillas extends Faction {
    name = 'guerrillas';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The People's Alliance";
        this.data.focus = 'enemy-kills-focus';
        this.data.skips = {
            max : 0,
            used : 0,
        };

        this.data.bonusDeploy = { type: 'champion', count : 1 };

        // tokens
        this.tokens['battle'].count = 2;

        this.tokens['traps'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'traps',
                resource: 1,
                areaStat : true,
                description : 'enemy players must pay 1 to move or re-deploy units from here',
                cost: 0,
            }
        };

        // units
        this.units['goon'].count = 4;
        this.units['goon'].data.redeployFree = true;

        this.units['talent'].count = 4;
        this.units['talent'].data.redeployFree = true;
        this.units['talent'].data.attack = [7, 7];

        this.units['mole'].count = 4;
        this.units['mole'].data.redeployFree = true;

        this.units['patsy'].count = 5;
        this.units['patsy'].data.attack = [9, 9];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Red Viper",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [7, 7],
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                toughness: true,
                flipped: false,
                onDeploy: 'bringUnits'
            }
        };
    }

    processUpgrade( n ){
       this.data.skips.max = n;
    }

    async onAfterSkill( area, units ) {
        let player, data;

        if (!units.length) return;

        // get areas with units
        let areas = this.areasWithEnemyUnits({adjacent: area.name});

        if (!areas.length) {
            this.game().message({faction: this, message: "snipers couldn't find a target", class: 'warning'});
            return false;
        }

        this.message({faction: this, message: `Snipers are searching for targets`});

        // prompt player to select an area
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-area',
            data: {
                areas: areas,
                show: 'units',
                enemyOnly: true,
                message: "Choose an area to target with your sniper attack of xA4x"
            }
        }).catch(error => console.error(error));

        let targetArea = this.game().areas[data.area];

        // resolve attack with that unit
        let output = await this.attack({area: targetArea, attacks: [4]});

        if ( output ) {
            await this.game().timedPrompt('noncombat-attack', {output: [output]})
                .catch(error => console.error(error));
        }
    }


    canActivateTraps(token, area) {
        return true;
    }

    trapsToken(args) {
        this.game().advancePlayer();
    }


    async bringUnits( event ) {
        let player, data;

        // if we didn't deploy from another area then return
        if (!event.from || event.from === event.unit.location) return;

        // if we don't have any more units in the from area then return
        if( ! this.data.units.find( unit => _.unitInArea( unit, event.from ) ) ) return;

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-units',
            data: {
                count : 20,
                areas : [event.from],
                playerOnly : true,
                canDecline : true,
                optionalMax : true,
                hideMax : true,
                message: `Choose units to move with Red Viper to The ${event.from}`
            }
        }).catch( error => console.error( error ) );
        if( data.decline ) return false;

        let units = data.units.map( unitId => this.game().objectMap[ unitId ] );

        units.forEach( unit => {
            unit.location = event.unit.location;
            if( unit.ready ) unit.ready = false;
        });


        this.game().message({ faction : this, message: `Sneaks ${units.length} unit${units.length > 1 ? 's':'' } to The ${event.unit.location}` });

        await this.game().timedPrompt('units-shifted', {
            message : `${units.length === 1 ? 'A Unit sneaks' : 'Units sneak'} to The ${event.unit.location}`,
            units: units
        });

    }

    factionCleanUp(){
        this.data.skips.used = 0;
    }
}




module.exports = Guerrillas;
