let Area = require( './Area' );


class Factory extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Your units gain +2 to their attack rolls";
        this.data.skill = "Start a battle in any area where you have a unit";
        this.data.adjacent = [ 'laboratory', 'capitol', 'bank' ];
    }

    takeControl( faction ){
        faction.data.attackBonus += 2;
    }

    loseControl( faction ){
        faction.data.attackBonus -= 2;
    }

    async skill( faction ){
        let player = {}, data = {};

        let areasWithFactionUnits = faction.areasWithUnits();
        let areaOptions = [];

        areasWithFactionUnits.forEach( areaName => {
            let area = faction.game().areas[areaName];
            if( area.canBattle() ){
                areaOptions.push( areaName );
            }
        });

        if( !areaOptions.length ){
            faction.game().message({
                message: 'No valid areas to start a battle',
                class : 'warning'
            });
            return;
        }

        // choose from the above areas
        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-area',
            data : {
                areas : areaOptions,
                show : 'units',
                message : 'Choose an area to start a battle'
            }
        }).catch( error => console.error( error ) );
        let area = faction.game().areas[data.area];

        await faction.game().battle( area );
    }
}


module.exports = Factory;
