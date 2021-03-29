let Card = require( './Card' );

class Mobilize extends Card {
    async handle( faction, area ){
        let args = {
            free: true,
            deployLimit: 2
        };
        return await this.cardDeploy( faction, area, args ).catch( error => console.error( error ) );
    }
}

module.exports = Mobilize;
