let Faction = require( './Faction' );


class Martyrs extends Faction {
    name = 'martyrs';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
           // "onCleanUp" : "resetIncarnationKilledBy"
        };

        //data
        this.data.name = this.name;
        this.data.focusDescription = "Lose many units";
        this.data.title = "The Martyrs of the Final Truth";
        this.controlsCombat = this.canControlCombat;

        // tokens
        delete this.tokens['battle'];

        this.tokens['martyr'] = {
            count: 2,
            data: {
                influence: 1,
                type: 'martyr',
                resource: 1,
                cost: 0,
                description: "Your killed units still produce influence in this area. Start a battle here if able.",
                req : "This token may always be activated"
            }
        };


        // units
        this.units['goon'].count = [4];
        this.units['mole'].count = [4];
        this.units['patsy'].count = [10];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "The Incarnation of Divinity",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [],
                cost: 0,
                killed: false,
                //killedBy: [],
                selected: false,
                hitsAssigned: 0,
                onDeploy: 'incarnationConvert',
                onUnitKilled: 'incarnationReborn',
            }
        };
    }

    processUpgrade(){
    }

    /**
     * Convert patsies when incarnation is deployed
     *
     * @param event
     * @returns {Promise<void>}
     */
    async incarnationConvert( event ){
        let area = this.game().areas[ event.unit.location ];
        let reservePatsyCount = this.unitsInReserves({ type: 'patsy' });
        let enemyPatsies = this.enemyUnitsInArea( area, { type : 'patsy', canBeReplaced: true } );

        let maxConversion = _.min([
            reservePatsyCount.length,
            Object.keys( enemyPatsies ).length
        ])

        if( !maxConversion ){
            return this.message( `The Incarnation of Divinity can't convert any patsies`, { class : 'warning' } );
        }

        let response = await this.prompt('choose-units', {
            count : maxConversion,
            areas : [area.name],
            unitTypes : ['patsy'],
            enemyOnly : true,
            differentPlayers : true,
            canBeReplaced: true,
            message: "Choose one patsy from each enemy player to convert"
        });

        let patsies = response.units.map( unitId => this.game().objectMap[unitId] );
        let originalPatsies = _.cloneDeep( patsies );

        patsies.forEach( async (unit) => {
            await this.replaceUnit( unit, { silent : true } );
        });

        await this.game().timedPrompt('units-shifted', {
            message : "The Incarnation of divinity finds new followers",
            units: originalPatsies,
        });
    }


    /**
     * Handle The Incarnation's death triggers
     *
     * @param event
     * @returns {Promise<void>}
     */
    async incarnationReborn( event ){
        let killer = this.game().factions[ event.unit.killed ]; //  who killed the queen
        let incarnation = this.getChampion();

        /*
        // if the same player kills The Incarnation of Divinity twice in a turn it stays dead
        if( incarnation.killedBy.includes( killer.name ) ){
            this.game().message({ faction : killer, message: `Have <span class="highlight">snuffed out</span> the light of divinity for a second time! This time it works` });
            return;
        }


        // mark this player has killed the incarnation
        incarnation.killedBy.push( killer.name );

        */

        // announce thw death and rebirth of the incarnation of divinity, the cycle begins anew!
        this.game().sound( 'holy' );
        this.game().message({ faction : killer, message: `Have struck down <span class="highlight">The Incarnation of Divinity</span>!` });

        // return incarnation to our reserves
        // this.returnUnitToReserves( incarnation );

        // steal a card
        await this.resolveIncarnationCardSteal( killer );
    }


    /**
     * Resolve stealing a card from the divinity's killers
     *
     * @param killer
     * @returns {Promise<void>}
     */
    async resolveIncarnationCardSteal( killer ){

        // abort if the killer has no cards to steal
        if( !killer.cardCount() ){
            return this.message( `The ${killer.name} have no cards for The Martyrs to steal`, { class : 'warning' } );
        }

        // let the killer choose a card
        let response = await this.game().promise({
            players: killer.playerId,
            name: 'discard-card',
            data : {
                message: 'choose a card to give to the martyrs',
                count : 1
            }
        });


        // transfer card
        let cardId = response[1].cards[0];
        let card = this.game().objectMap[cardId];

        _.moveItemById(
            card.id,
            killer.data.cards.hand,
            this.data.cards.hand
        );

        this.message( `Takes a card from the ${killer.name} as punishment for their transgression against the divine`);
    }


    /**
     * Reset The Incarnation has been killed by players array
     */
    resetIncarnationKilledBy(){
        let incarnation = this.getChampion();
        incarnation.killedBy = [];
    }


    canControlCombat( faction, battle ){
        let completedAttacks = battle.data.completedAttacks[faction.name];
        return this.hasUnitsInArea( battle.area, { notType : 'patsy' } ) && completedAttacks === 0;
    }


    /**
     * Can we active our martyr token?
     * @returns true
     */
    canActivateMartyr() {
        return true;
    }


    /**
     * Handle martyr token activation
     *
     * @param args
     */
    async activateMartyrToken( args ) {
        // start a battle here
        await this.game().battle( args.area, { attackBonus : this.data.upgrade } );
        this.game().advancePlayer();
    }

}


module.exports = Martyrs;
