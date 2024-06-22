let Faction = require( './Faction' );


class Guerrillas extends Faction {
    name = 'guerrillas';

    constructor(owner, game) {
        super(owner, game);

        // triggers
        this.triggers = {
            "onCleanUp" : "resetAmbushUsedCount",
            //"onMoveAll" : "checkForTraps",
            //"onDeployAll" : "checkForTraps",
        };


        //data
        this.data.name = this.name;
        this.data.title = "The People's Alliance";
        this.data.focusDescription = "Kill many units in enemy areas";
        this.data.flipableUnits = ['champion'];
        this.data.viperMoveCount = 1;
        this.data.trappedAreas = [];
        this.data.maxTraps = 6;

        // tracks the number of ambush actions we have available each turn
        this.data.ambushes = {
            max : 1,
            used : 0,
        };

        // tokens
        this.tokens['deploy'].count = 4;
        delete this.tokens['battle'];

        this.tokens['snipers'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'snipers',
                resource: 1,
                cost: 0,
                description: "If you have a unit in this area, make an attack of {1} in an adjacent area",
                req : "This token must be discarded if you cannot make an attack with it"
            }
        };

        // units
        this.units['goon'].count = 4;
        //this.units['goon'].data.redeployFree = true;

        this.units['talent'].count = 4;
        //this.units['talent'].data.redeployFree = true;

        this.units['mole'].count = 4;
        //this.units['mole'].data.redeployFree = true;

        this.units['patsy'].count = 6;
        this.units['patsy'].data.attack = [8, 8];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Red Viper",
                type: 'champion',
                basic: false,
                attack: [5, 5],
                warAttack: [5, 5],
                peaceAttack: [],
                influence: 0,
                warInfluence: 0,
                peaceInfluence: 3,
                canDeployFlipped: true,
                deployFlippedMethod: "setPeaceSide",
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                flipped: false,
                onDeploy: 'viperDeploy',
                //onMove: 'viperBoobyTrap'
            }
        };
    }


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
       this.data.ambushes.max = upgrade + 1;
    }


    /**
     * Can we activate our sniper token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateSnipers( token, area ) {
        return !! this.areasWithEnemyUnits({}, area.name ).length;

        /*
        // do we have a valid target?
        let validTargets = !! this.areasWithEnemyUnits({}, area.name ).length;
        // do we have a unit in this area to be our trigger man
        let hasUnitToShootWith = this.hasUnitsInArea( area );
        return validTargets && hasUnitToShootWith;
        */
    }


    /**
     * Handle activating our sniper token
     *
     * @param args
     */
    async activateSnipersToken( args ) {
        let area = args.area;

        // get areas with units
        let areas = this.areasWithEnemyUnits({}, area.name );

        // if there are no targets we are donezo here
        if ( ! areas.length ) {
            this.message( "snipers couldn't find a target", { class: 'warning' } );
            return;
        }

        this.message(`Snipers are searching for targets` );

        // prompt player to select an area to snipe
        let response = await this.prompt( 'choose-area',  {
            areas: areas,
            show: 'units',
            enemyOnly: true,
            message: "Choose an area to target with your sniper attack of xA1x"
        });

        let targetArea = this.game().areas[response.area];

        // resolve attack with that unit
        let output = await this.attack({ area: targetArea, attacks: [1] });

        if ( output ) {
            await this.game().timedPrompt('noncombat-attack', {output: [output]})
                .catch(error => console.error(error));
        }

        this.game().advancePlayer();
    }


    /**
     * Handle our ambush action
     *
     * @param player
     * @param areaName
     */
    async takeAmbushAction( player, areaName ){

        // show popup
        this.game().popup( this.playerId, { type: 'ambush', area : areaName, faction : this.name });

        let area = this.game().areas[areaName];

        try {
            await this.resolveAmbushAction( area );
        } catch( error ){
            console.error( error );
        }

        this.game().advancePlayer();
    }


    /**
     * Resolve our ambush action
     *
     * @param area
     */
    async resolveAmbushAction( area ){

        // if we don't have any ambushes left, or any revealed tokens to discard here then we can't resolve this action
        if( (this.data.ambushes.used >= this.data.ambushes.max) || !this.hasRevealedTokenInArea( area ) ) {
            this.message( `Can't ambush in the ${ area.name }`, { class: 'warning' } );
            return;
        }

        // chose our token to discard
        let response = await this.prompt( 'choose-tokens', {
            count : 1,
            areas : [area.name],
            playerOnly : true,
            revealedOnly : true
        });

        let token = this.game().objectMap[response.tokens[0]];
        if( !token ) return this.message( `Declines to ambush in the ${ area.name }`, { class: 'warning' });

        // use up an ambush
        this.data.ambushes.used++;

        _.discardToken( token, area );

        this.message(`Launches an ambush in the ${ area.name }`,{ class: 'highlight' });

        // begin a battle in this area
        await this.game().battle( area ).catch( error => console.error( error ) );
    }


    /**
     * Do we have a revealed token in the area?
     *
     * @param area
     * @returns {boolean}
     */
    hasRevealedTokenInArea( area ){
        return area.data.tokens.some( token => token.faction === this.name && token.revealed );
    }


    /**
     * Handle viper deploy trigger
     *
     * @param event
     */
    async viperDeploy( event ){
        // viper is no longer free to our deploy limit
        // await this.chooseViperSide();

        // handle bring units trigger
        //await this.viperBoobyTrap( event );
    }

    viperBoobyTrap( event ){
        let area = event.from;

        // if viper wasn't moved/deployed from an area do nothing
        if( !area || area === event.unit.location ) return;

        // if we have already used our max traps
        if(this.data.trappedAreas.length >= this.data.maxTraps){
           return this.message( `Red Viper has run out of booby traps`, { class: 'warning' } );
        }

        // place a trap
        this.data.trappedAreas.push( area );
        this.message( `Red Viper places a <span class="faction-guerrillas">booby trap</span> in the ${area}`);
    }

    /**
     *
     * @param event
     * @returns {Promise<void>}
     */
    async checkForTraps(event){
        for(let unitEvent of event.units){
            let unit = unitEvent.unit;
            if( unit.faction !== this.name && this.data.trappedAreas.includes( unit.location ) ){
                await this.explodeTrap(unit);
                return;
            }
        }
    }

    async explodeTrap( unit ){
        let count = this.data.trappedAreas.filter( area => area === unit.location ).length;
        this.data.trappedAreas = this.data.trappedAreas.filter( area => area !== unit.location );

        let messageStart = count === 1 ? `A trap` : `${count} traps`;
        this.message( `${messageStart} placed by Red Viper has been triggered by the <span class="faction-${unit.faction}">${unit.faction}</span> in the ${unit.location}`);

        await this.nonCombatAttack( 4, count, unit.location, unit.faction );
    }

    /**
     * Choose which side to place Red Viper on
     */
    async chooseViperSide(){

        let response = await this.prompt( 'choose-viper-side', {});

        const viper = this.getChampion();

        if( response.side === 'war'){
            viper.flipped = false;
            viper.attack = [...viper.warAttack];
            viper.influence = viper.warInfluence;
        }

        if( response.side === 'peace'){
            viper.flipped = true;
            viper.attack = [...viper.peaceAttack];
            viper.influence = viper.peaceInfluence;
        }
    }

    unflipUnit( viper ) {
        viper.flipped = false;
        viper.attack = [...viper.warAttack];
        viper.influence = viper.warInfluence;
    }

    setPeaceSide( viper ){
        viper.flipped = true;
        viper.attack = [...viper.peaceAttack];
        viper.influence = viper.peaceInfluence;
    }


    /**
     * handle end of turn reset ambush trigger
     */
    resetAmbushUsedCount(){
        this.data.ambushes.used = 0;
    }


}




module.exports = Guerrillas;
