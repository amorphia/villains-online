let Area = require( './Area' );

class Sewers extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Gain +1 Deploy Limit";
        this.data.skill = "Choose one of your units, deploy a unit of that type to the same area without paying its unit cost";
        this.data.adjacent = [ 'capitol', 'police', 'church' ];
        this.data.adjacentAlts = {
            police : "laboratory",
            church : "subway",
        };
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    takeControl( faction ){
        // gain +1 deploy limit
        faction.data.deployLimit++;
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    loseControl( faction ){
        // lose 1 deploy limit
        faction.data.deployLimit--;
    }


    /**
     * Resolve this area's skill ability
     *
     * @param faction
     */
    async skill( faction ){

        // get areas where we have units, and if we have none abort
        let areasWithUnits = faction.areasWithUnits( faction, { deployable : true } );
        if( ! areasWithUnits.length  ){
            faction.message( "No units in play", { class: 'warning' } );
            return false;
        }

        // get the unit types we can clone, and if there are none abort
        let unitTypes = this.getCloneableUnitTypes( faction, areasWithUnits );
        if( !unitTypes.length ){
            faction.message( "No valid unit types to duplicate", { class: 'warning' });
            return false;
        }

        // prompt player to choose a unit to clone
        let response = await faction.prompt( 'choose-units', {
            count : 1,
            areas : areasWithUnits,
            unitTypes: unitTypes,
            playerOnly : true,
            message: "Choose a unit to duplicate"
        });

        await this.resolveCloneUnit( response, faction );
    }


    /**
     * Return an array of cloneable unit types
     *
     * @param faction
     * @param areasWithUnits
     * @returns {[]}
     */
    getCloneableUnitTypes( faction, areasWithUnits ){
        // lets make a list of unit types we can deploy
        let unitTypes = {};

        // get areas that are trapped
        let trappedAreas = this.getTrappedAreas( areasWithUnits, faction );

        // cycle through our units
        faction.data.units.forEach( unit => {
            if( this.unitTypeIsCloneable( unit, trappedAreas ) ){
                unitTypes[unit.type] = true;
            }
        });

        return Object.keys( unitTypes );
    }


    /**
     * Return an array of areas that are trapped from our areas with units
     *
     * @param areasWithUnits
     * @param faction
     * @returns {Area[]}
     */
    getTrappedAreas( areasWithUnits, faction ){
        let trappedAreas = [];

        areasWithUnits.forEach( area => {
            if( _.areaIsTrapped( faction, this.game().data.areas[area] ) ) trappedAreas.push( area );
        });

        return trappedAreas;
    }


    /**
     * Is our unit type cloneable?
     *
     * @param unit
     * @param trappedAreas
     * @returns {boolean}
     */
    unitTypeIsCloneable( unit,  trappedAreas ){
        return _.unitInReserves( unit )
            || ( _.unitInPlay( unit ) && !trappedAreas.includes( unit.location ) )
    }


    /**
     * Resolve our clone unit skill
     *
     * @param response
     * @param faction
     */
    async resolveCloneUnit( response, faction ){
        // get our unit object
        let unit = this.game().objectMap[ response.units[0] ];

        let args = {
            area: unit.location,
            faction: faction,
            player: faction.playerId,
            free: true,
            deployLimit: 1,
            unitTypes: [unit.type],
        };

        // deploy the selected unit
        let output = await faction.deploy( args );

        if ( output?.declined ){
            faction.message( `Can't deploy to the ${unit.location}` );
        }
    }

}


module.exports = Sewers;
