let Card = require( './Card' );

class ShowInitiative extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        // get areas with our attacking units in them, if none, abort
        let areas = this.faction.areasWithAttackingUnits();
        if( !areas.length  ){
            this.faction.message( "No attacks may be made", { class: 'warning' });
            return false;
        }

        // prompt player to select a unit to attack with
        let response = await this.faction.prompt( 'choose-units', {
            count : 1,
            areas : areas,
            hasAttack: true,
            playerOnly : true,
            showEnemyUnits: true,
            message: "Choose a unit to make an attack"
        });

        // get our unit object
        let unit = this.faction.game().objectMap[ response.units[0] ];

        // resolve attack with that unit
        let output = await this.faction.attack({
            area : this.faction.game().areas[ unit.location ],
            attacks : unit.attack,
            unit : unit,
            seeking : true,
        });

        if( output ){
            await this.faction.game().timedPrompt('noncombat-attack', { output : [output] } )
                .catch( error => console.error( error ) );
        }
    }
}

module.exports = ShowInitiative;
