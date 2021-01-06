let Faction = require( './Faction' );


class Vampires extends Faction {
    name = 'skeletons';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Restless Dead";
        this.data.focus = 'units-in-enemy-areas-focus';
        this.data.focusDescription = "Have units of specific types in enemy areas";
        this.data.optionalAttack = true;
        this.data.endOfTurnRevive = 2;

        // icons
        this.data.statusIcon = 'skeleton';
        this.data.statusDescription = 'has skeleton units';
        this.data.flippedUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];

        // tokens
        this.tokens['card'].count = 4;
        delete this.tokens['deploy'];

        this.tokens['lich'] = {
            count: 2,
            data: {
                influence: 1,
                type: 'deploy',
                cost: 0,
            }
        };

        // units
        this.units['goon'].count = 3;
        this.units['goon'].data.onDamaged = 'checkBecomeSkeleton';
        this.units['goon'].data.baseAttack = [5,5];
        this.units['goon'].data.flipped = false;
        this.units['goon'].data.skeleton = false;
        this.units['goon'].data.baseInfluence = 1;

        this.units['mole'].count = 3;
        this.units['mole'].data.onDamaged = 'checkBecomeSkeleton';
        this.units['mole'].data.baseAttack = [9];
        this.units['mole'].data.flipped = false;
        this.units['mole'].data.skeleton = false;
        this.units['mole'].data.baseInfluence = 2;

        this.units['talent'].data.onDamaged = 'checkBecomeSkeleton';
        this.units['talent'].data.baseAttack = [7];
        this.units['talent'].data.flipped = false;
        this.units['talent'].data.skeleton = false;
        this.units['talent'].data.baseInfluence = 1;
        this.units['talent'].data.baseSkilled = true;

        this.units['patsy'].count = 2;
        this.units['patsy'].data.onDamaged = 'checkBecomeSkeleton';
        this.units['patsy'].data.baseAttack = [];
        this.units['patsy'].data.flipped = false;
        this.units['patsy'].data.skeleton = false;
        this.units['patsy'].data.baseInfluence = 0;


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Xer'Zhul",
                type: 'champion',
                basic: false,
                baseInfluence: 1,
                influence: 1,
                baseAttack: [6,6,6],
                attack: [6,6,6],
                cost: 2,
                flipped: false,
                killed: false,
                selected: false,
                skeleton: false,
                hitsAssigned: 0,
                onDamaged : 'checkBecomeSkeleton',
                onDeploy : 'xerZhulEnters',
                onMove : 'xerZhulEnters'
            }
        };
    }

    factionCombatMods( mods, area ) {
        mods.push({
            type: 'becomeSkeleton',
            text: `Face up units assigned a hit become skeletons, rather than being killed`
        });
        return mods;
    }


    processUpgrade( upgrade ) {
        this.data.endOfTurnRevive = upgrade;
    }


    canActivateLich( token, area ) {
        return this.canActivateDeploy( token, area ) || this.hasUnitsInArea( area );
    }


    async lichToken( args ) {

        // resolve deploy
        let output = await this.deploy( args );

        // resolve flip
        let unitsFlipped = await this.flipUnits( { area :  args.area } );

        // check if we did either of these things
        if( output && output.declined && !unitsFlipped ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.game().advancePlayer();

    }

    async flipUnits( options = {} ){
        let areas, player, data;

        // set area(s) we are allowed to flip units in
        if( options.area ) areas = [options.area.name];
        else areas = this.areasWithUnits({ flipped : options.flippedOnly  });

        // init our choose data
        let chooseData = {
            optionalMax: true,
            areas : areas,
            playerOnly : true,
            canDecline : true
        };

        // set our choose units to flip message
        chooseData.message = options.flippedOnly ? "Choose units to flip face-up" : "Choose units to flip up or down";

        // set count
        if( options.count ){
            chooseData.count = options.count;
        } else {
            chooseData.count = 20;
            chooseData.hideMax = true;
        }

        if( options.flippedOnly ) chooseData.flippedOnly = true;

        // choose units to flip
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-units',
            data : chooseData,
        }).catch( error => console.error( error ) );

        // no unit selected? Welp, guess we are done here
        if( !data.units ){
            this.game().message({  message : 'Declines to flip units', faction : this });
            return;
        }

        // convert IDs to unit objects
        let units = data.units.map( unitId => this.game().objectMap[unitId] );

        // then flip the selected units appropriately
        units.forEach( unit => {
            if( unit.flipped ) this.unitUnflipped( unit );
            else this.becomeSkeleton( unit );
        });

        // announce what units were flipped
        await this.game().timedPrompt('units-shifted', {
            message : `Skeleton units flipped`,
            units: units
        });

    }

    checkBecomeSkeleton( event ){
        if( event.unit.flipped || event.count > 1 ) return;

        this.becomeSkeleton( event.unit );
        return `transforms ${event.unit.name} into a skeleton`;
    }


    becomeSkeleton( unit ) {
        if( !unit.flipped && !unit.killed ) {
            unit.flipped = true;
            unit.attack = [6];
            unit.influence = 0;
            unit.skeleton = true;
            if (unit.skilled) unit.skilled = false;
            if (unit.ready) unit.ready = false;
        }
    }


    unitUnflipped( unit ) {
        unit.flipped = false;
        unit.attack = unit.baseAttack;
        unit.skeleton = false;
        unit.influence = unit.baseInfluence;
        if ( unit.baseSkilled ) unit.skilled = true;
    }


    getTokenMoveAreas( toArea ){
        let areas = [];

        Object.values( this.game().data.areas ).forEach( area => {
            if( toArea.data.adjacent.includes( area.name )
                && area.tokens.find( token => token.faction === this.name ) ) areas.push( area.name );
        });

        return areas;
    }


    async xerZhulEnters( event ){
        let unit = event.unit;
        let player, data, area = this.game().areas[unit.location];

        // get adjacent areas with valid tokens to move
        let areasWithValidTokens = this.getTokenMoveAreas( area );
        // if we don't have any valid tokens to move abort
        if( ! areasWithValidTokens.length ) return this.game().message({ faction: this, message : "No valid tokens for Xer'Zhul to move" });

        // player optionally chooses a token to move
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-tokens',
            data : {
                count : 1,
                areas : areasWithValidTokens,
                optional : true,
                playerOnly : true,
                message : `Have Xer'Zhul move a token to the ${area.name}?`
            }
        }).catch( error => console.error( error ) );

        // if we didn't choose a token, abort
        if( !data.tokens ) return this.game().message({ faction: this, message : `Declines to move a token to the ${area.name}` });

        // move token
        let token = this.game().objectMap[ data.tokens[0] ] ;

        // remove from old area
        let fromArea = this.game().areas[token.location];
        _.discardToken( token, fromArea );

        //move to new area
        token.location = area.name;
        area.data.tokens.push( token );
        this.game().message({ faction: this, message : `Xer'Zhul moves a token from The ${fromArea.name} to the ${area.name}` });
    }


    async cleanUp() {
        if( !this.data.endOfTurnRevive ) return;

        await this.flipUnits({
            count : this.data.endOfTurnRevive,
            flippedOnly : true
        })
    }

}


module.exports = Vampires;
