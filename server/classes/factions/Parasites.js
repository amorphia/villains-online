let Faction = require( './Faction' );


class Parasites extends Faction {
    name = 'parasites';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Tau Ceti Parasites";
        this.data.focus = 'most-units-areas-focus';
        this.data.focusDescription = "Have the most units in many areas";
        this.data.podDeployCostReduction = 0;


        // tokens
        this.tokens['pod'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'pod',
                cost: 0,
                resource : 1
            }
        };

        // units
        this.units['goon'].count = 6;
        this.units['mole'].count = 6;
        this.units['talent'].count = 4;
        this.units['patsy'].count = 5;


        this.units['champion'] = {
            count: 2,
            data: {
                name: "Host",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [],
                skilled: true,
                ready: false,
                cost: 1,
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };
    }

    factionCombatMods( mods, area ) {
        if ( this.data.units.find( unit => _.unitInArea( unit, area, { type : 'champion' } ) ) ) {

            mods.push({
                type: 'hostInfect',
                text: `If the First Host survives this combat the Parasites clone in this area`
            });
        }

        return mods;
    }

    processUpgrade( n ) {
        this.data.podDeployCostReduction = n;
    }


    async infect( area ) {
        let player, data, unit, targetFaction;

        let factionsToExclude = [];
        let types = this.unitTypesInReserves();

        targetFaction = await this.selectEnemyPlayerWithUnitsInArea( area, 'Choose player to clone', {types: types} );

        if (!targetFaction) {
            this.game().message({
                faction: this,
                message: "No victims for The Parasites to clone",
                class: 'warning'
            });
            return;
        }

        let message = `must choose a unit to become a duplicant`;
        this.game().message({faction: targetFaction, message: message});

        // player chooses unit to be replaced
        [player, data] = await this.game().promise({
            players: targetFaction.playerId,
            name: 'choose-units',
            data: {
                count: 1,
                playerOnly: true,
                unitTypes: types,
                message: 'Choose a unit to become cloned',
                areas: [area.name]
            }
        }).catch(error => console.error(error));
        unit = this.game().objectMap[data.units[0]];

        let clone = this.data.units.find( item => item.type === unit.type && _.unitInReserves( item ) );
        clone.location = area.name;
        clone.ready = false;

        await this.game().timedPrompt('units-shifted', {
            message : `A duplicant ${clone.name} was cloned in the ${area.name}`,
            units: [clone]
        });
    }




    async onAfterSkill( area, units ) {
        if ( !units.length ) return;
        await this.infect( area );
    }

    async onAfterBattle( combat ) {
        let firstHost = this.data.units.find( unit => unit.type === 'champion' && _.unitInArea( unit, combat.area ) );
        if ( !firstHost ) return;

        await this.infect( combat.area );
    }


    async onAfterActivateToken( token ){
        let player, data, area = this.game().areas[token.location];
        if(! token || !area ) return;

        let basicTokens = ['move','deploy','card','battle'];

        let pod = this.data.tokens.find( token => token.type === 'pod' && token.revealed && token.location === area.name );

        // check if pod duplication is valid
        if( !pod
            || token.faction === this.name
            || !basicTokens.includes( token.type )
        ) return;

        let fakeToken = Object.assign({}, token, { faction : this.name } );

        this.game().message({ faction : this, message: `may duplicate The ${token.faction} ${token.type} token` });

        // ask player if they want to duplicate token
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-pod',
            data: {
                    token : fakeToken,
                    area : area.name
                }
            }).catch( error => console.error( error ) );

        if( data.decline ) return this.game().message({ faction : this, message: "decline to duplicate this action" });

        let action = _.camelCase( fakeToken.name ) + 'Token';
        let options = {
            player : player,
            token : fakeToken,
            area : area,
            pod : true,
            reduceCost : this.data.podDeployCostReduction
        };

        await this[action]( options );
    }


    canActivatePod( token, area ) {
        return true;
    }


    podToken(){
        this.game().advancePlayer();
    }

}


module.exports = Parasites;
