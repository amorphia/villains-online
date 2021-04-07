let Card = require( './Card' );

class SlipInTheBack extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){

        // do we have a talent to deploy?
        if( ! this.hasTalentToDeploy() ){
            this.faction.message( "No talents to deploy", { class : 'warning'  });
            return;
        }

        let args = {
            free: true,
            deployLimit: 1,
            unitTypes: ['talent'],
            readyUnits: true
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
    hasTalentToDeploy(){
        return this.faction.data.units.some( unit => unit.type === 'talent' // do we have a talent
                                                 && !unit.noDeploy // that isn't prevented from being deployed
                                                 && !unit.killed ); // and isn't killed?
    }
}


module.exports = SlipInTheBack;
