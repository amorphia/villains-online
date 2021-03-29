let Card = require( './Card' );

class SlipInTheBack extends Card {
    async handle( faction, area ){

        if( !faction.data.units.find(
            unit => unit.type === 'talent'
                && !unit.noDeploy
                && !unit.killed
        )){
            faction.game().message({ faction : faction, message: "No talents to deploy", class : 'warning'  });
            return;
        }

        let args = {
            free: true,
            deployLimit: 1,
            unitTypes: ['talent'],
            readyUnits: true
        };
        return await this.cardDeploy( faction, area, args ).catch( error => console.error( error ) );
    }
}


module.exports = SlipInTheBack;
