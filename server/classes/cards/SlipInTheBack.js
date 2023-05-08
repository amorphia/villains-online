let Card = require( './Card' );

class SlipInTheBack extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){

        // do we have a talent to deploy?
        if( ! this.hasSkilledUnitToDeploy() ){
            this.faction.message( "No skilled units to deploy", { class : 'warning'  });
            return;
        }

        let args = {
            free: true,
            deployLimit: 1,
            isSkilled: true,
            readyUnits: true,
        };

        // deploy a talent, and ready it
        return await this.cardDeploy( this.faction, this.area, args )
            .catch( error => console.error( error ) );
    }


    /**
     * Do we have a talent to deploy?
     *
     * @returns {boolean}
     */
    hasSkilledUnitToDeploy(){
        const destinationHasKau = this.area.hasKau(this.faction);
        const trappedAreas = this.game.trappedAreas();

        return this.faction.data.units.some( unit => unit.skilled === true // do we have a talent
            && !unit.noDeploy // that isn't prevented from being deployed
            && !unit.killed // and isn't killed?
            && (!destinationHasKau || unit.type !== 'champion') // and isn't being blocked by Kau
            && !trappedAreas.includes(unit.location) // and isn't trapped
        );
    }
}


module.exports = SlipInTheBack;
