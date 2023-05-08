let Faction = require( './Faction' );


class Survivalists extends Faction {
    name = 'survivalists';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.focusDescription = "Have units in enemy areas";
        this.data.title = "Coalition of Preppers";
        this.data.zeke = null;
        this.data.unitPropAttackBonus = { startedPrepared : 0 };

        this.triggers = {
            "onDeployAll" : "checkBugOut",
            "onMoveAll" : "checkBugOut",
            'onSetup' : 'setZekeData',
            "onCleanUp" : "prepareUnits"
        };

        // tokens
        this.tokens['deploy'].count = 4;

        /*
        this.tokens['scrounge'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'scrounge',
                cost: 0,
                resource: 2,
                description: "Action cards your opponents play here are added to your hand instead of being discarded",
                req : "Passive token: this token may always be activated",
                collectDiscardedCards: true,
            }
        };
        */

        /*
        this.tokens['shelter'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'shelter',
                cost: 0,
                resource: 2,
                description: "Discard this token as an action to return one of your killed basic units here to play",
                req : "Passive token: this token may always be activated",
                collectDiscardedCards: true,
            }
        };
        */

        this.tokens['scrounge'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'scrounge',
                cost: 0,
                resource: 2,
                description: "Extra Refunded (gain xRxxRx when revealed), if you have no other tokens or units here you may deploy a patsy to this area, it becomes prepared",
                req : "Discard this token if you do not deploy a patsy when activating it",
            }
        };

        // units
        this.units['mole'].data.prepared = false;
        this.units['mole'].data.skilled = false;
        this.units['mole'].data.ready = false;
        this.units['mole'].data.onDamaged = 'checkPrepperToughness';

        this.units['goon'].data.prepared = false;
        this.units['goon'].data.skilled = false;
        this.units['goon'].data.ready = false;
        this.units['goon'].data.onDamaged = 'checkPrepperToughness';

        this.units['patsy'].count = 8;
        this.units['patsy'].data.prepared = false;
        this.units['patsy'].data.attack = [9];
        this.units['patsy'].data.skilled = false;
        this.units['patsy'].data.ready = false;
        this.units['patsy'].data.onDamaged = 'checkPrepperToughness';

        delete this.units['talent'];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Ol' Zeke",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [5],
                cost: 1,
                toughness: true,
                flipped: false,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                soloDefenseBonus: 3,
                skilled: true,
                ready: false,
            }
        };
    }

    processUpgrade( upgrade ){
        this.data.unitPropAttackBonus = { startedPrepared : (upgrade * 2) };
    }

    /**
     * Can we activate our scrounge token?
     *
     * @param token
     * @param area
     * @returns {boolean}
    */
    canActivateScrounge( token, area ) {
        return !this.hasUnitsInArea( area ) && this.tokensInArea( area ).length <= 1;
    }

    /**
     * Resolve our scrounge token
     *
     * @param args
     * @returns {Promise<void>}
    */
     async activateScroungeToken( args ) {
        args.deployLimit = 1;
        args.unitTypes = 'patsy';

        let output = await this.deploy( args );

        // if we didn't deploy anything, discard the token
        if( output?.declined ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        let unit = output?.units[0]?.unit;
        console.log("scrounge unit", unit);
        this.becomePrepared(unit, false);

        this.game().advancePlayer();
    }

    /**
     * Can we activate our shelter token?
     *
     * @param token
     * @param area
     * @returns {boolean}

     canActivateShelter( token, area ) {
        return true;
    }
    */

    /**
     * Resolve our shelter token
     *
     * @param args
     * @returns {Promise<void>}

     async activateShelterToken( args ) {
        this.game().advancePlayer();
    }
    */
    /**
     * Take a shelter action by removing a shelter token
     *
     * @param player
     * @param areaName

    async takeShelterAction( player, areaName ){
        let area = this.game().areas[areaName];

        // show popup
        this.game().popup( this.playerId, { type: 'shelter', area : areaName, faction : this.name });

        // choose revive unit
        await this.reviveUnits({
            reviveCount: 1,
            areas: [areaName],
            basicOnly: true,
        });

        // discard our shelter token
        let token = this.data.tokens.find(token => token.type === "shelter");
        _.discardToken( token, area );

        // advance the game
        this.game().advancePlayer();
    }
     */

    /**
     *
     * @param event
     * @returns {string}
     */
    checkPrepperToughness( event ){
        // event.hits is the number of hits assigned to this unit
        if( !event.unit.flipped || event.hits > 1 ){
            return;
        }

        this.unflipUnit( event.unit );
        return `${event.unit.name} was prepared to survive this attack`;
    }

    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {

        if(area.name === this.data.zeke.location){
            mods.push({
                type: 'zekeHide',
                text: `If Ol' Zeke is alone in this area units attacking you suffer -3 to their attack rolls`
            });
        }

        if(this.data.upgrade > 0){
            mods.push({
                type: 'prepperAttack',
                text: `Your prepared units in this area gain ${this.data.upgrade * 2} to their attack rolls`
            });
        }

        return mods;
    }

    /**
     * Each unit in an enemy area becomes prepared
     */
    prepareUnits(){
        this.data.units.forEach( unit => {
            if( unit.type === 'champion' || !_.unitInPlay( unit, { notFlipped : true } ) ) return;

            let areaOwner = this.game().areas[unit.location].data.owner;
            if( areaOwner && areaOwner !== this.name ) this.becomePrepared( unit )
        });
    }

    /**
     * Become vampire triggered event
     *
     * @param
     */
    becomePrepared( unit, ready = true ) {
        if( unit.flipped || unit.killed || !unit.location ) return;

        unit.flipped = true;
        unit.prepared = true;
        unit.skilled = true;
        unit.ready = ready;
    }

    /**
     * Unflip a unit
     *
     * @param unit
     */
    unflipUnit( unit ) {
        unit.flipped = false;
        if( unit.type === 'champion' ) return;

        unit.prepared = false;

        if( !unit.baseSkilled ) {
            unit.skilled = false;
            unit.ready = false;
        }
    }


    async checkBugOut( event ){
        let areas = [];

        for(let unitEvent of event.units){
            let unit = unitEvent.unit;
            let area = this.game().areas[unit.location];
            if(this.canBugOutFromArea( unit, area, areas )){
                await this.chooseBugOut(area);
                areas.push(area.name);
                return;
            }
        }
    }

    canBugOutFromArea( unit, area, areas ){
        // we can't bug out from ourselves
        if(unit.faction === this.name) return false;

        // we can't bug out twice from the same area
        if(areas.includes(area.name)) return false;

        // if this area is trapped we can't bug out
        if( area.isTrapped( this ) ) return false;

        // if we have fewer than 2 units in this area we can't bug out
        if( this.unitsInArea( area ).length < 2 ) return false;

        // if we have no unwebbed units we can't bug out
        if( this.unitsInArea( area, { notWebbed : true } ).length < 1 ) return false;

        // if we have no where to bug out to, we can't bug out
        if(!this.getBugOutDestinations( area ).length) return false;

        // otherwise we are good!
        return true;
    }

    async chooseBugOut( area ){
        // allow a player to make their move away choices
        let response = await this.prompt( 'move-away', {
            fromArea: area.name,
            toAreas: this.getBugOutDestinations( area ),
            message : 'Choose unit to bug out of The ' + area.name,
            promptMessage: 'A Survivalist bugs out from The ' + area.name,
            limit : 1,
        }).catch( error => console.error( error ) );

        // if we decline, then abort
        if( response.decline ) return;

        await this.resolveMoveAwayToken( {}, response );
    }

    getBugOutDestinations( area ){
        let areas = area.getDeployableAdjacentAreas();
        console.log("getBugOutDestinations areas", areas);
        return areas.filter( areaName => {
            console.log("!this.hasUnitsInArea( areaName )", !this.hasUnitsInArea( areaName ));
            return !this.hasUnitsInArea( areaName );
        });
    }


    /**
     * On setup, make a convenience reference to zeke
     */
    setZekeData(){
        this.data.zeke = this.getChampion();
    }
}




module.exports = Survivalists;
