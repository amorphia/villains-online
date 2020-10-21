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
        this.data.playersToInfect = 1;
        this.sacrificeAction = null;


        // tokens
        this.tokens['pod'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'pod',
                cost: 0,
            }
        };

        // units
        this.units['goon'].count = 6;
        this.units['talent'].count = 4;
        this.units['mole'].count = 6;
        this.units['patsy'].count = 8;


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
                text: `If the First Host survives this combat the Parasites infect this area`
            });
        }

        return mods;
    }

    processUpgrade( n ) {
        this.data.playersToInfect = n + 1;
    }


    async infect( area ){
        let player, data, targetFaction;

        let factionsToExclude = [];

        for( let i = 0; i < this.data.playersToInfect; i++ ) {

            try {
                targetFaction = await this.selectEnemyPlayerWithUnitsInArea( area, 'Choose player to infect', { basic: true, exclude : factionsToExclude });
            } catch (error) {
                console.error(error);
            }

            if ( !targetFaction ) {
                this.game().message({
                    faction: this,
                    message: "No victims for The Parasites to Infect",
                    class: 'warning'
                });
                return;
            }

            factionsToExclude.push( targetFaction.name );

            let message = `<span class="faction-${targetFaction.name}">the ${targetFaction.name}</span> must choose a unit to become infected`;
            this.game().message({ faction: targetFaction, message: message });

            let enemyUnits = _.factionUnitsInArea(targetFaction, area, {basic: true});
            let unit;

            // player chooses unit to be replaced
            if ( enemyUnits.length !== 1 ){
                [player, data] = await this.game().promise({
                    players: targetFaction.playerId,
                    name: 'choose-units',
                    data: {
                        count: 1,
                        basicOnly: true,
                        playerOnly: true,
                        showReserves: this.name,
                        message: 'Choose a unit to become infected',
                        areas: [area.name]
                    }
                }).catch(error => console.error(error));
                unit = this.game().objectMap[data.units[0]];
            } else {
                unit = enemyUnits[0];
            }

            let result = await this.replaceUnit(unit, {message: `A ${unit.type} becomes infected`});
            if (result === false) {
                this.game().message({faction: this, message: "The infected unit dies"});
                await this.game().killUnit(unit, this);
            }
        }
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
        await this[action]({ player : player, token : fakeToken, area : area, pod : true });
    }


    canActivatePod( token, area ) {
        return true;
    }


    podToken(){
        this.game().advancePlayer();
    }

}


module.exports = Parasites;
