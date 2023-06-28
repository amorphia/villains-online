let Area = require( './Area' );

class Subway extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Your MOVE tokens are not limited by adjacency";
        this.data.skill = "Deploy one unit to any area (pay costs normally).";
        this.data.adjacent = [ 'university', 'capitol', 'church' ];
        this.data.adjacentAlts = {
            university : "bank",
            church : "sewers",
        };
    }

    /**
     * Resolve this area's skill ability
     *
     * @param faction
     */
    async skill( faction ){

        // deploy one unit to any area
        let output = await faction.deploy({
            faction: faction,
            player: faction.playerId,
            deployLimit: 1,
        });

        if ( output?.declined ){
            faction.message( `Failed to deploy`, { class : 'warning' });
        }
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    takeControl( faction ){
        // this faction's moves are no longer limited by adjacency
        faction.data.farMove = true;
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    loseControl( faction ){
        // this faction's moves are now limited by adjacency
        faction.data.farMove = false;
    }
}


module.exports = Subway;
