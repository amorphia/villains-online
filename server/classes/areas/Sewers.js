let Area = require( './Area' );

class Sewers extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Gain +1 Deploy Limit";
        this.data.skill = "Choose one of your units, deploy a unit of that type to that area for free";
        this.data.adjacent = [ 'capitol', 'police', 'church' ];
    }

    takeControl( faction ){
        faction.data.deployLimit++;
    }

    loseControl( faction ){
        faction.data.deployLimit--;
    }


    cloneableUnitTypes( faction, areasWithUnits ){
        // lets make a list of unit types we can deploy
        let potentialUnitTypes = {
            'goon' : 0,
            'talent' : 0,
            'patsy' : 0 ,
            'mole' : 0,
            'champion' : 0
        };

        let trappedAreas = [];
        areasWithUnits.forEach( area => {
            if( _.areaIsTrapped( faction, this.game().data.areas[area] ) ) trappedAreas.push( area );
        });

        // from our reserves
        faction.data.units.forEach( unit => {
            if( _.unitInReserves( unit ) ){
                potentialUnitTypes[unit.type] = 2;
            } else if( _.unitInPlay( unit ) && !trappedAreas.includes( unit.location ) ) {
                potentialUnitTypes[unit.type]++;
            }
        });

        let unitTypes = [];
        _.forEach( potentialUnitTypes, (val,type) => {
            if( val >= 1 ) unitTypes.push( type );
        });

        return unitTypes;
    }

    async skill( faction ){
        let player = {}, data = {};


        let areasWithUnits = faction.areasWithUnits( faction, { deployable : true } );
        if( ! areasWithUnits.length  ){
            faction.game().message({
                faction: faction,
                message: "No units in play",
                class: 'warning'
            });
            return false;
        }


        let unitTypes = this.cloneableUnitTypes( faction, areasWithUnits );
        if( !unitTypes.length ){
            faction.game().message({
                faction : faction,
                message: "No valid unit types to duplicate",
                class: 'warning'
            });
            return false;
        }


        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-units',
            data : {
                count : 1,
                areas : areasWithUnits,
                unitTypes: unitTypes,
                playerOnly : true,
                message: "Choose a unit to duplicate"
            }
        }).catch( error => console.error( error ) );
        let unit = faction.game().objectMap[ data.units[0] ];


        let args = {
            area: unit.location,
            faction: faction,
            player: faction.playerId,
            free: true,
            deployLimit: 1,
            unitTypes: [unit.type],
        };

        let output = await faction.deploy( args );
        if ( output && output.declined ){
            faction.game().message({
                faction: faction,
                message: `Can't deploy to the ${unit.location}`
            });
        }

    }
}


module.exports = Sewers;
