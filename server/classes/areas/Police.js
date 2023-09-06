let Area = require( './Area' );

class Police extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "You may look at each enemy target (after picking yours)";
        this.data.skill = "Make an attack with any one of your units";
        this.data.adjacent = [ 'sewers', 'capitol', 'laboratory' ];
        this.data.adjacentAlts = {
            sewers : "church",
            laboratory : "bank",
        };
    }
    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    takeControl( faction ){
        faction.data.spyAll = true;
    }
    /**
     * Handle a faction losing control of this area
     *
     * @param faction
     */
    loseControl( faction ){
        faction.data.spyAll = false;
    }


    /**
     * Resolve this area's skill ability
     *
     * @param faction
     */
    async skill( faction ){

        // get areas with our attacking units in them, if none, abort
        let areas = faction.areasWithAttackingUnits();
        if( !areas.length  ){
            faction.message( "No attacks may be made", { class: 'warning' });
            return false;
        }

        // prompt player to select a unit to attack with
        let response = await faction.prompt( 'choose-units', {
            count : 1,
            areas : areas,
            hasAttack: true,
            playerOnly : true,
            showEnemyUnits: true,
            message: "Choose a unit to make an attack"
        });

        await this.resolvePoliceAttack( response, faction );
    }


    /**
     * Resolve our police attack
     *
     * @param response
     * @param faction
     */
    async resolvePoliceAttack( response, faction ){
        // get our unit object
        let unit = faction.game().objectMap[ response.units[0] ];

        // resolve attack with that unit
        let output = await faction.attack({
            area : this.game().areas[ unit.location ],
            attacks : unit.attack,
            unit : unit
        });

        if( output ){
            await this.game().timedPrompt('noncombat-attack', { output : [output] } )
                .catch( error => console.error( error ) );
        }
    }

}

module.exports = Police;
