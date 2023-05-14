let Faction = require( './Faction' );


class Martyrs extends Faction {
    name = 'martyrs';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
           "onCleanUp" : "resetMemorials",
            "onFactionUnitKilled" : "makeMemorial",
        };

        //data
        this.data.name = this.name;
        this.data.focusDescription = "Lose many units";
        this.data.title = "The Martyrs of the Final Truth";
        this.controlsCombat = this.canControlCombat;
        this.data.maxMemorials = 1;
        this.data.memorials = {};

        // tokens
        delete this.tokens['battle'];

        this.tokens['martyr'] = {
            count: 2,
            data: {
                influence: 1,
                type: 'martyr',
                resource: 1,
                cost: 0,
                description: "You may have any number of memorials here. you may start a battle here.",
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

    processUpgrade( upgrade ){
        this.data.maxMemorials = upgrade + 1;
    }

    /**
     * Convert patsies when incarnation is deployed
     *
     * @param event
     * @returns {Promise<void>}
     */
    async incarnationConvert( event ){
        let area = this.game().areas[ event.unit.location ];
        let enemyUnits = this.enemyUnitsInArea( area );
        let maxConversion = Object.keys( enemyUnits ).length;

        if( !maxConversion ){
            return this.message( `The Incarnation of Divinity can't recruit new followers`, { class : 'warning' } );
        }

        let trappedAreas = this.game().trappedAreas();
        let areasWithPatsies = this.areasWithUnits({ type: "patsy" })
            .filter(areaName  => areaName !== area.name && !trappedAreas.includes( areaName ) );

        let response = await this.prompt('global-place', {
            count : maxConversion,
            area : area.name,
            fromAreas: areasWithPatsies,
            unitTypes : ['patsy'],
            message: `Choose up to ${maxConversion} patsies to place in the ${area.name}`,
        });

        if(response.decline){
            return this.message( `The Incarnation of Divinity declines to spread the glorious truth` );
        }

        let patsies = response.units.map( unitId => this.game().objectMap[unitId] );

        patsies.forEach( unit => unit.location = area.name );

        await this.game().timedPrompt('units-shifted', {
            message : "The Incarnation of divinity sends missionaries to recruit new followers",
            units: patsies,
        });
    }

    makeMemorial( unit ) {
        const areaName = unit.location;

        if (!this.data.memorials[areaName]) {
            return this.data.memorials[areaName] = 1;
        }

        let maxMemorials = this.data.tokens.some( token => token.type === 'martyr' && token.revealed && token.location === areaName ) ? 25 : this.data.maxMemorials;
        if ( this.data.memorials[areaName] < maxMemorials ){
            this.data.memorials[areaName]++;
        }
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

        this.messagePlayer({
            message : 'You drew the following',
            type : 'cards',
            cards : [card],
        });

        this.message( `Takes a card from the ${killer.name} as punishment for their transgression against the divine`);
    }


    /**
     * Reset The Incarnation has been killed by players array
     */
    resetMemorials(){
        this.data.memorials = {};
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
        await this.startMartyrBattle( args );
        this.game().advancePlayer();
    }

    async startMartyrBattle( args ) {

        if(!args.area.canBattle()){
            return this.message( `No battle may take place in the ${args.area.name}`, { class: 'warning' } );
        }

        // prompt player to decide to move lotus dancer
        let response = await this.prompt( 'question', {
            message: `Start a battle in the ${args.area.name}?`
        });

        if ( !response.answer ){
            return this.message( `The Martyrs choose peace in the ${args.area.name}` );
        }

        // start a battle here
        await this.game().battle( args.area );
    }

}


module.exports = Martyrs;
