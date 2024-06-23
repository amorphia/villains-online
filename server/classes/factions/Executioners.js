let Faction = require( './Faction' );

class Executioners extends Faction {
    name = 'executioners';

    constructor(owner, game) {
        super(owner, game);

        // triggered events
        this.triggers = {
            "onStartOfTurn" : "chooseCondemned",
            "onBeforeCombatStep" : "headsmanExecute",
            "onAfterActivateToken" : "headsmanMove",
            "onMoveAll" : "checkForDetain",
            "onDeployAll" : "checkForDetain",
            "onAfterSkill" : "afterSkillAttack",
            "onCleanUp" : "clearDetainedArea",
        };

        // data
        this.data.name = this.name;
        this.data.title = "The Sinner's Judgement";
        this.data.focusDescription = "Kill units belonging to the condemned player";
        this.data.condemned = "";
        this.data.detainedArea = null;
        this.data.nonUnitAttackBonus = 0;
        this.data.detainAttack = 7;
        this.data.skillAttack = 5;
        this.data.headsmenExecuteLimit = 2;

        // tokens
        this.tokens['detain'] = {
            count: 1,
            data: {
                cost : 0,
                influence: 2,
                resource: 1,
                type : 'detain',
                areaStat : true,
                description: `Make an attack of ${this.data.detainAttack} against each enemy unit that is moved or deployed away from this area`,
                req : "This token may always be activated"
            }
        };

        // units
        this.units['goon'].count = 4;
        this.units['mole'].count = 4;
        this.units['patsy'].count = 6;
        this.units['patsy'].data.attack = [7];
        this.units['talent'].count = 6;


        this.units['champion'] = {
            count: 1,
            data: {
                name: "The Silent Headsman",
                type: 'champion',
                basic: false,
                influence: 3,
                attack: [],
                cost: 1,
                killed: false,
                toughness: true,
                flipped: false,
                selected : false,
                hitsAssigned : 0
            }
        };
    }

    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        this.data.nonUnitAttackBonus = upgrade * 2;
    }

    /**
     * Sort this faction to the front of combat order if there is a condemned unit in the area
     *
     * @param combatFactions
     */
    battleOrderSort( combatFactions ) {

        if( !combatFactions.find( faction => faction.name === this.data.condemned ) ) return;

        combatFactions.sort( (a, b) => {
            if ( a.name === this.name ) return -1;
            if ( b.name === this.name ) return 1;
            return a.order - b.order
        });
    }

    /**
     *
     * @returns {*}
     */
    condemnedKills(){
        return _.factionCondemnedKills( this, this.game().factions );
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async headsmanExecute(){
        let headsman = this.getChampionInPlay();
        if( !headsman ) return;

        let area = headsman.location;
        let executeableFactions = 0;

        Object.values( this.game().factions ).forEach( faction => {
            executeableFactions += this.getUnitsToSacrificeCount( faction, area );
        });

        if( !executeableFactions ) return this.message("The Silent Headsman has no units to execute", { class: "warning" });

        // prompt player to decide to execute with the Headsman
        let response = await this.prompt( 'question', {
            message: `Have The Silent Headsman execute units in the ${headsman.location}?`,
            showUnits: headsman.location,
        });

        if ( !response.answer ) return this.message( 'The Silent Headsman declines to execute' );

        let promises = [];
        let units = [];

        // cycle through each faction and have that player sacrifice units equal to the areas they control
        Object.values( this.game().factions ).forEach( faction => {
            promises.push( this.factionHeadsmanSacrifice( faction, units, area) );
        });

        let responses = await Promise.all( promises );

        await this.resolveHeadsmanSacrificeResponses( responses, units );

        // display the results
        if( units.length ){
            this.game().sound( 'basta' );
            await this.game().timedPrompt('units-shifted', {
                message: `The Silent Headsman executed the following units`,
                units: units
            });
        }
    }

    /**
     *
     * @param faction
     * @param units
     * @param area
     * @returns {Promise<{faction: *, units: *, player: *}>}
     */
    async factionHeadsmanSacrifice( faction, units, area ){
        // get how many units we need to sacrifice, if we don't have any to sacrifice return
        let unitsToSacrifice = this.getUnitsToSacrificeCount( faction, area );
        if( !unitsToSacrifice ) return;

        let [player, response] = await this.game().promise({
            players: faction.playerId,
            name: 'sacrifice-units',
            message: `The Silent Headsman has come to claim the lives of ${unitsToSacrifice} sinners`,
            data : {
                count : unitsToSacrifice,
                areas : [area],
            }});

        this.game().updatePlayerData();

        return {
            player,
            faction,
            units : response.units,
        }
    }

    /**
     *
     * @param faction
     * @param area
     * @returns {number}
     */
    getUnitsToSacrificeCount( faction, area ){
        let units = faction.unitsInArea( area );
        let totalUnits = units.length;

        if(totalUnits > this.data.headsmenExecuteLimit){
            return totalUnits - this.data.headsmenExecuteLimit;
        }

        return 0;
    }

    /**
     *
     * @param responses
     * @param units
     * @returns {Promise<void>}
     */
    async resolveHeadsmanSacrificeResponses( responses, units ){
        for( let response of responses ) {
            await this.resolveFactionSacrificeUnits( response, units );
        }
    }

    /**
     *
     * @param response
     * @param units
     * @returns {Promise<void>}
     */
    async resolveFactionSacrificeUnits( response, units ){
        if(!response?.player){
            return;
        }

        // clear our prompt
        response?.player?.setPrompt({ active : false, updatePlayerData : true });

        let unitNames = [];

        // cycle through our units
        for( let unitId of response.units ){
            // get the unit object
            let unit = this.game().objectMap[unitId];
            // add its name to our names array
            unitNames.push( unit.name );
            // add it to our units results array
            units.push( unit );
            // kill this unit
            await this.game().killUnit( unit, this );
        }

        // log the results
        let message = `sacrifices <span class="faction-${response.faction.name}item">${unitNames.join(', ')}</span>`;
        response.faction.message( message );
    }

    /**
     *
     * @param token
     * @returns {Promise<void>}
     */
    async headsmanMove( token ){
        if(token.faction === this.name || token.type !== 'move') return;

        // if the token revealed wasn't a battle token, or lotus dancer isn't in play, then abort
        let headsman = this.getChampionInPlay();
        if (!headsman) return;

        if(this.money() < 1){
            this.message("Can't pay to follow with The Silent Headsman", { class: "warning" });
            return;
        }

        // get lotus dancer's area, and the token's area
        let headsmanArea = this.game().areas[headsman.location];
        let area = this.game().areas[token.location];

        // check if headsman can't legally move
        if (!area.data.adjacent.includes(headsman.location)) return;

        // choose to dance or not
        this.message( 'The Silent Headsman deciding whether to follow the move' );
        await this.chooseToFollow( headsman, area );
    }

    /**
     *
     * @param headsman
     * @param area
     * @returns {Promise<void>}
     */
    async chooseToFollow( headsman, area ){
        // prompt player to decide to move Headsman
        let response = await this.prompt( 'question', {
            message: `Move The Silent Headsman from the ${headsman.location} to the ${area.name}?`
        });

        if ( !response.answer ) return this.message( 'The Silent Headsman declines to follow' );

        // resolve move
        await this.resolveHeadsmanMove( headsman, area );
    }

    /**
     *
     * @param headsman
     * @param area
     * @returns {Promise<void>}
     */
    async resolveHeadsmanMove( headsman, area ){
        // set Headsman new area
        await this.placeUnit( headsman, area.name );
        this.payCost( 1, true );

        // show results to all players
        this.game().sound('wiff');
        this.message( `The Silent Headsman slips into the ${area.name}` );

        await this.game().timedPrompt('units-shifted', {
            message: `The Silent Headsman slips into the ${area.name}`,
            units: headsman
        }).catch(error => console.error(error));
    }

    /**
     *
     * @param area
     * @returns {Promise<void>}
     */
    async afterSkillAttack( area ){
        let enemyUnits = this.enemyUnitsInArea( area, { notHidden: true } );

        if( !Object.keys( enemyUnits ).length ){
            this.message( `No units in the ${area.name} to attack`, { class : 'warning' } );
            return;
        }

        // resolve attack with that unit
        let output = await this.attack({ area: area, attacks: [this.data.skillAttack] });

        if ( output ) {
            await this.game().timedPrompt('noncombat-attack', {output: [output]})
                .catch(error => console.error(error));
        }
    }

    /**
     * Can we activate our token?
     *
     * @returns {boolean}
     */
    canActivateDetain( token, area ){
        return true;
    }

    /**
     *
     * @param args
     */
    activateDetainToken( args ){
        this.data.detainedArea = args.area.name;

        // just advance the game, easy as pie
        this.game().advancePlayer();
    }

    /**
     *
     */
    clearDetainedArea(){
        this.data.detainedArea = null;
    }

    /**
     *
     * @param event
     * @returns {Promise<void>}
     */
    async checkForDetain(event){
        let kills = [];

        for(let unitEvent of event.units){
            let unit = unitEvent.unit;
            if( this.data.detainedArea && !unit.hidden && unit.faction !== this.name && this.data.detainedArea === unitEvent.from ){
                let result = await this.detainAttack( unit );
                if(result) kills.push( result );
            }
        }

        if(kills.length){
            await this.game().timedPrompt('units-shifted', {
                message: `The ${this.name} hit the following units while they tried to escape`,
                units: kills
            });
        }
    }

    /**
     *
     * @param unit
     * @returns {Promise<*>}
     */
    async detainAttack( unit ){
        // resolve attack with that unit
        let output = await this.attack({ area: this.game().areas[unit.location], attacks: [this.data.detainAttack], targets: [unit.faction], targetUnit: unit });

        if ( output ) {
            await this.game().timedPrompt('noncombat-attack', {output: [output]})
                .catch(error => console.error(error));
        }

        if( output.hits ){
            return output.targetUnit;
        }
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async chooseCondemned(){
        let highestPoints = 0;
        let factionPoints = [];

        Object.values(this.game().data.factions).forEach(faction => {
            if(faction.name === this.name) return;

            let totalPoints = faction.ap + faction.pp;

            if(highestPoints < totalPoints) highestPoints = totalPoints;
            factionPoints.push({ name: faction.name, points: totalPoints });
        });

        let condemned = _.sample(factionPoints.filter( faction => faction.points === highestPoints ));
        this.data.condemned = condemned.name;

        this.game().updatePlayerData();
        this.game().sound( 'basta' );
        this.message( `The ${this.data.condemned} have been condemned` );
    }

    /**
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {
        if( area.units().find( unit => unit.faction === this.data.condemned ) ){
            mods.push( { type : 'attackFirst', text : `Attacks first in combat when a condemned unit is present` });
        }

        return mods;
    }
}


module.exports = Executioners;
