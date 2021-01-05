let Faction = require( './Faction' );


class Vampires extends Faction {
    name = 'skeletons';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Restless Dead";
        // todo this.data.focus = 'units-in-enemy-areas-focus';
        this.data.focusDescription = "Have units of specific types in enemy areas";
        this.data.optionalAttack = true;
        this.data.endOfTurnRevive = 0;

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
        this.units['goon'].count = 4;
        this.units['goon'].data.onDamaged = 'becomeSkeleton';
        this.units['goon'].data.baseAttack = [5,5];
        this.units['goon'].data.flipped = false;
        this.units['goon'].data.baseInfluence = 1;

        this.units['mole'].count = 4;
        this.units['mole'].data.onDamaged = 'becomeSkeleton';
        this.units['mole'].data.baseAttack = [9];
        this.units['mole'].data.flipped = false;
        this.units['mole'].data.baseInfluence = 2;

        this.units['talent'].data.onDamaged = 'becomeSkeleton';
        this.units['talent'].data.baseAttack = [7];
        this.units['talent'].data.flipped = false;
        this.units['talent'].data.baseInfluence = 1;
        this.units['talent'].data.baseSkilled = true;

        this.units['patsy'].count = 2;
        this.units['patsy'].data.onDamaged = 'becomeSkeleton';
        this.units['patsy'].data.baseAttack = [];
        this.units['patsy'].data.flipped = false;
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
                hitsAssigned: 0,
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

    }

    becomeSkeleton( event ) {
        let unit = event.unit;

        if( !unit.flipped && !unit.killed ){
            unit.flipped = true;
            unit.vampire = true;
            unit.attack = unit.attack.map( attack => attack - 2 );
            let message = `<span class="faction-vampires">${unit.name}</span> becomes a vampire in The ${unit.location}`;
            this.message({ message: message, faction : this });
        }
    }

    unitUnflipped( unit ) {
        unit.flipped = false;
        unit.vampire = false;
        unit.attack = unit.attack.map( attack => attack + 2 );
    }


    getTokenMoveAreas( toArea ){
        let areas = [];

        Object.values( this.game().data.areas ).forEach( area => {
            if( toArea.data.adjacent.includes( area.name )
                && area.tokens.find( token => token.faction === this.name && !token.revealed ) ) areas.push( area.name );
        });

        return areas;
    }


    async xerZhulEnters( event ){
        let player, data, area = this.game().areas[cordella.location];

        // get adjacent areas with valid tokens to move
        let areasWithValidTokens = this.getTokenMoveAreas( area );
        // if we don't have any valid tokens to move abort
        if( ! areasWithValidTokens.length ) return this.game().message({ faction: this, message : 'No valid tokens for Cordella to move' });

        // player optionally chooses a token to move
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-tokens',
            data : {
                count : 1,
                areas : areasWithValidTokens,
                optional : true,
                playerOnly : true,
                unrevealedOnly: true,
                message : `Flip Cordella to move a token to the ${area.name}?`
            }
        }).catch( error => console.error( error ) );

        // if we didn't choose a token, abort
        if( !data.tokens ) return this.game().message({ faction: this, message : `Declines to move a token to the ${area.name}` });

        // unflip cordella
        this.unitUnflipped( cordella );

        // move token
        let token = this.game().objectMap[ data.tokens[0] ] ;

        // remove from old area
        let fromArea = this.game().areas[token.location];
        _.discardToken( token, fromArea );

        //move to new area
        token.location = area.name;
        area.data.tokens.push( token );
        this.game().message({ faction: this, message : `Cordella spends her magick to move a token from The ${fromArea.name} to the ${area.name}` });
    }




}


module.exports = Vampires;
