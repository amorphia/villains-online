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
        this.data.unitPropAttackBonus = { prepared : 0 };

        this.triggers = {
            "onDeployAll" : "checkBugOut",
            "onMoveAll" : "checkBugOut",
            'onSetup' : 'setZekeData',
            "onCleanUp" : "prepareUnits"
        };

        // tokens
        this.tokens['deploy'].count = 4;

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


        // units
        this.units['mole'].prepared = false;
        this.units['mole'].skilled = false;
        this.units['mole'].ready = false;
        this.units['mole'].data.onDamaged = 'checkPrepperToughness';

        this.units['goon'].prepared = false;
        this.units['goon'].skilled = false;
        this.units['goon'].ready = false;
        this.units['goon'].data.onDamaged = 'checkPrepperToughness';

        this.units['patsy'].count = 6;
        this.units['patsy'].prepared = false;
        this.units['patsy'].preparedAttack = [9];
        this.units['patsy'].baseAttack = [];
        this.units['patsy'].skilled = false;
        this.units['patsy'].ready = false;
        this.units['patsy'].data.onDamaged = 'checkPrepperToughness';

        this.units['talent'].count = 4;
        this.units['talent'].prepared = false;
        this.units['talent'].baseSkilled = true;
        this.units['talent'].data.onDamaged = 'checkPrepperToughness';

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Ol' Zeke",
                type: 'champion',
                basic: false,
                influence: 0,
                attack: [6,6],
                cost: 1,
                toughness: true,
                flipped: false,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                soloDefenseBonus: 3,
            }
        };
    }

    processUpgrade( upgrade ){
        this.data.unitPropAttackBonus = { prepared : (upgrade * 2) };
    }

    /**
     * Can we activate our scrounge token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateScrounge( token, area ) {
        return true;
    }


    /**
     * Resolve our scrounge token
     *
     * @param args
     * @returns {Promise<void>}
     */
    async activateScroungeToken( args ) {
        this.game().advancePlayer();
    }


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
    becomePrepared( unit ) {
        if( unit.flipped || unit.killed || !unit.location ) return;

        unit.flipped = true;
        unit.prepared = true;
        unit.skilled = true;
        unit.ready = true;

        if(unit.preparedAttack) unit.attack = [...unit.preparedAttack];
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

        if( unit.baseAttack ) unit.attack = [...unit.baseAttack];

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
        if(!this.getBugOutDestinations( area )) return false;

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
        return areas.filter( areaName => !this.hasUnitsInArea( areaName ));
    }


    /**
     * On setup, make a convenience reference to zeke
     */
    setZekeData(){
        this.data.zeke = this.getChampion();
    }
}




module.exports = Survivalists;
