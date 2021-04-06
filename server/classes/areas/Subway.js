let Area = require( './Area' );

class Subway extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Your MOVE tokens are not limited by adjacency";
        this.data.skill = "Deploy one unit to any area (pay costs normally).";
        this.data.adjacent = [ 'university', 'capitol', 'church' ];
    }


    async skill( faction ){

        let args = {
            faction: faction,
            player: faction.playerId,
            deployLimit: 1,
        };

        let output = await faction.deploy( args );

        if ( output && output.declined ){
            faction.game().message({
                faction : faction,
                message: `Failed to deploy`,
                class : 'warning'
            });
            return;
        }

    }

    takeControl( faction ){
        faction.data.farMove = true;
    }

    loseControl( faction ){
        faction.data.farMove = false;
    }
}


module.exports = Subway;
