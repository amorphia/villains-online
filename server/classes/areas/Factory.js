let Area = require( './Area' );


class Factory extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Your units gain +2 to their attack rolls";
        this.data.skill = "Start a battle in any area where you have a unit";
        this.data.adjacent = [ 'laboratory', 'capitol', 'bank' ];
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    takeControl( faction ){
        faction.data.attackBonus += 2;
    }


    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    loseControl( faction ){
        faction.data.attackBonus -= 2;
    }


    /**
     * Resolve this area's skill ability
     *
     * @param faction
     */
    async skill( faction ){
        // get areas where we have units
        let areasWithFactionUnits = faction.areasWithUnits();

        // get our area options, and if there are none then abort
        let areas = this.getBattleAreaOptions( areasWithFactionUnits, faction );
        if( !areas.length ){
            faction.message( 'No valid areas to start a battle', { class : 'warning' } );
            return;
        }

        // choose from our areas the area to start a battle in
        let response = await faction.prompt( 'choose-area', {
            areas : areas,
            show : 'units',
            message : 'Choose an area to start a battle'
        });

        // start a battle in that area
        let area = faction.game().areas[response.area];
        await faction.game().battle( area );
    }


    /**
     * Return an array of areas where we can trigger our battle skill
     *
     * @param areasWithFactionUnits
     * @param faction
     * @returns {[]}
     */
    getBattleAreaOptions( areasWithFactionUnits, faction ){
        let areas = [];

        areasWithFactionUnits.forEach( areaName => {
            let area = faction.game().areas[areaName];
            if( area.canBattle() ){
                areas.push( areaName );
            }
        });

        return areas;
    }

}


module.exports = Factory;
