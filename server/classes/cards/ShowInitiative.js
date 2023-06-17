let Card = require( './Card' );

class ShowInitiative extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        // get areas with our attacking units in them, if none, abort
        let areas = this.faction.areasWithAttackingUnits();

        if( !areas.includes( this.area.name )  ){
            faction.message( "No attacks may be made", { class: 'warning' });
            return false;
        }

        // get our attacker
        let unit = await this.getAttacker();

        // resolve attack with that unit
        let output = await this.faction.attack({
            area : this.area,
            attacks : unit.attack,
            unit : unit,
            seeking: true,
        });

        if( !output ) return;

        if( output.hasKill ){
            this.faction.gainAP( 1 );
        }

        await this.game.timedPrompt('noncombat-attack', { output : [output] } )
            .catch( error => console.error( error ) );
    }

    async getAttacker(){
        // prompt player to select a unit to attack with
        let response = await this.faction.prompt( 'choose-units', {
            count : 1,
            areas : [ this.area.name ],
            hasAttack: true,
            playerOnly : true,
            showEnemyUnits: true,
            message: "Choose a unit to make an attack"
        });

        // get our unit object
        return this.faction.game().objectMap[ response.units[0] ];
    }
}

module.exports = ShowInitiative;
