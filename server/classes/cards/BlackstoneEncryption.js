let Card = require( './Card' );

class BlackstoneEncryption extends Card {
    async handle( faction, area ){
        let player = {}, data = {}, chosenArea;

        let areas = {};
        _.forEach( faction.game().areas, area => {
            if( _.hasUnitsInArea( faction, area ) && !_.hasUsedSkill( faction, area ) ){
                areas[area.name] = true;
            }
        });
        areas = Object.keys( areas );

        if( !areas.length ){
            faction.game().message({ message : 'No valid areas to resolve Blackstone Encryption', class : 'warning' });
            return;
        }

        if( areas.length === 1 ){
            chosenArea = areas[0];
        } else {
            [player, data] = await faction.game().promise({
                players: faction.playerId,
                name: 'choose-skill',
                data : { areas : areas  }
            }).catch( error => console.error( error ) );
            chosenArea = data.area;
        }

        // activate that skill
        try {
            await faction.useSkill( chosenArea );
        } catch( error ){
            console.error( error );
        }

    }
}

module.exports = BlackstoneEncryption;
