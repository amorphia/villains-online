let Area = require( './Area' );

class University extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Your patsies are skilled";
        this.data.skill = "Look at each face-down action token in the area of your choice.";
        this.data.adjacent = [ 'factory', 'capitol', 'subway' ];
        this.data.adjacentAlts = {
            factory : "bank",
            subway : "church",
        };
    }

    /**
     * Resolve this area's skill ability
     *
     * @param faction
     */
    async skill( faction ){

        // get the areas we can spy on, and if none exist abort
        let areas = faction.game().areasWithUnrevealedTokens();
        if( ! areas.length  ){
            faction.message( "No areas with unrevealed tokens", { class: 'warning'} );
            return false;
        }

        // prompt player to choose an area to spy on
        let response = await faction.prompt( 'choose-area', {
            areas : areas,
            show : 'tokens',
            message : 'Choose area to spy on tokens'
        });

        // resolve token spy ability, and announce the results
        faction.data.tokenSpy.push( response.area );
        faction.game().message({
            faction : faction,
            message: `looks at the tokens in the ${response.area}`
        });
    }


    /**
     * Handle a faction taking control of this area
     *
     * @param faction
     */
    takeControl( faction ){
        // this faction gains skilled patsies flag
        faction.data.skilledPatsies = true;

        // set each patsy to skilled
        faction.data.units.forEach( unit => {
            if( unit.type === 'patsy' ) unit.skilled = true;
        });
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    loseControl( faction ){
        // this faction loses skilled patsies flag
        faction.data.skilledPatsies = false;

        // remove skilled from each patsy
        faction.data.units.forEach( unit => {
            if( unit.type === 'patsy' && unit.skilled && !unit.prepared ){
                unit.skilled = false;
            }

            faction.exhaustUnskilledUnits();
        });
    }


}

module.exports = University;
