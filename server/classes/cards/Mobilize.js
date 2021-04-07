let Card = require( './Card' );

class Mobilize extends Card {

    /**
     * Resolve this card ability
     */
    async handle(){
        // deploy two free units
        return await this.cardDeploy( this.faction, this.area, { free: true, deployLimit: 2 } )
            .catch( error => console.error( error ) );
    }
}

module.exports = Mobilize;
