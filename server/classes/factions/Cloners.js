let Faction = require( './Faction' );


class Cloners extends Faction {

    name = 'cloners';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
        };

        // data
        this.data.name = this.name;
        this.data.focusDescription = "Have many duplicate units in an areas";
        this.data.title = "The Replacement Guild";
        this.data.upgradeDeploy = 0;
        this.data.flipableUnits = ['champion'];
        this.data.tokenDeflect = true;

        // tokens
        this.tokens['clone'] = {
            count: 1,
            data: {
                influence: 1,
                cost : 0,
                description: "Choose one of your units, deploy a unit of that type to the same area without paying its unit cost.",
                req : "this token must be discarded if you do not deploy a unit with it"
            }
        };

        // units
        this.units['goon'].count = 6;
        this.units['mole'].count = 8;
        this.units['talent'].count = 6;
        this.units['patsy'].count = 8;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Experiment X",
                toughness: true,
                flipped: false,
                type: 'champion',
                additionalTypes: ['goon', 'mole', 'patsy', 'talent'],
                basic: false,
                influence: 4,
                attack: [5, 5],
                cost: 2,
                skilled: true,
                ready: false,
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };
    }


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        this.data.deployLimit += ( upgrade - this.data.upgradeDeploy );
        this.data.upgradeDeploy = upgrade;
    }


    /**
     * Can we activate our Clone token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateClone( token, area ) {
        // are there any of your units in play?
        return this.unitsInPlay().length > 0;
    }


    discardEarliestTokensInArea( count, area ){
        for(let i = 0; i < count; i++){
            let token = area.data.tokens.find(token => token.faction === this.name && token.location === area.name);
            if( !token ) return this.message("Failed to discard token", { class: "warning" });
            let tokenSpot = _.discardToken( this.game().objectMap[token.id], area );

            // display results
            let message = `Removes <span class="faction-${token.faction}">the ${token.faction} token</span> from the ${tokenSpot} slot of the ${area.name}`;
            this.message( message );
        }
    }


    /**
     * Handle activating a clone token
     *
     * @param args
     */
    async activateCloneToken( args ){
        // get areas where we have units, and if we have none abort
        let areasWithUnits = this.areasWithUnits( { deployableType : true } );

        // get the unit types we can clone, and if there are none abort
        let unitTypes = this.getCloneableUnitTypes( areasWithUnits );
        if( !unitTypes.length ){
            this.message( "No valid unit types to duplicate", { class: 'warning' });
            this.game().advancePlayer();
            return false;
        }

        // prompt player to choose a unit to clone
        let response = await this.prompt( 'choose-units', {
            count : 1,
            areas : areasWithUnits,
            unitTypes: unitTypes,
            playerOnly : true,
            message: "Choose a unit to duplicate"
        });

        await this.resolveCloneUnit( response );

        this.game().advancePlayer();
    }

    async resolveCloneUnit( response ){
        // get our unit object
        let unit = this.game().objectMap[ response.units[0] ];
        let additionalTypes = unit.additionalTypes ?? [];

        let args = {
            area: unit.location,
            faction: this,
            player: this.playerId,
            free: true,
            deployLimit: 1,
            unitTypes: [unit.type, ...additionalTypes],
        };

        // deploy the selected unit
        let output = await this.deploy( args );

        if ( output?.declined ){
            this.message( `Can't deploy to the ${unit.location}` );
        }

        return output;
    }

    getCloneableUnitTypes( areasWithUnits ){
        // lets make a list of unit types we can deploy
        let unitTypes = {};

        // get areas that are trapped
        let trappedAreas = this.getTrappedAreas( areasWithUnits );

        // cycle through our units
        this.data.units.forEach( unit => {
            if( this.unitTypeIsCloneable( unit, trappedAreas ) ){
                unitTypes[unit.type] = true;
                if( unit.additionalTypes ){
                    unit.additionalTypes.forEach( type => unitTypes[type] = true );
                }
            }
        });

        return Object.keys( unitTypes );
    }

    getTrappedAreas( areasWithUnits ){
        let trappedAreas = [];

        areasWithUnits.forEach( area => {
            if( _.areaIsTrapped( this, this.game().data.areas[area] ) ) trappedAreas.push( area );
        });

        return trappedAreas;
    }

    unitTypeIsCloneable( unit,  trappedAreas ){
        return _.unitInReserves( unit )
            || ( _.unitInPlay( unit, { deployableType : true } ) && !trappedAreas.includes( unit.location ) )
    }


    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {
        if( this.data.tokens.find( token => token.location === area.name ) ){
            mods.push( { type : 'tokenDeflect', text : `May discard the earliest token in this area to ignore an assigned hit` });
        }

        return mods;
    }
}

module.exports = Cloners;
