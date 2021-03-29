let Card = require( './Card' );

class LetGodSortThemOut extends Card {
    async handle( faction, area ){
        let promises = [];
        let units = [];

        try {
            _.forEach( faction.game().factions, item => {
                let areasOwned = item.areas().length;
                let unitsInPlay = item.data.units.filter( unit => unit.location && !unit.killed );
                let unitsToSacrifice = Math.min( areasOwned, unitsInPlay.length );

                if( unitsToSacrifice > 0 ){

                    let areas = {};
                    unitsInPlay.forEach( unit => areas[unit.location] = true );
                    areas = Object.keys( areas );

                    promises.push( faction.game().promise({ players: item.playerId, name: 'sacrifice-units', data : { count : unitsToSacrifice, areas : areas  } }).then( async ([player, data]) => {

                        let unitNames = [];
                        for( let u of data.units ){
                            let unit = faction.game().objectMap[u];
                            unitNames.push( unit.name );
                            units.push( unit );
                            await faction.game().killUnit( unit, faction );
                        }

                        let message = `sacrifices <span class="faction-${item.name}item">${unitNames.join(', ')}</span>`;
                        faction.game().message({ faction: item, message: message });
                        player.setPrompt({ active : false, playerUpdate : true });
                    }));
                }
            });


            await Promise.all( promises );

            await faction.game().timedPrompt('units-shifted', {
                message: `The ${faction.name} killed the following units`,
                units: units
            });

        } catch( error ){
            console.error( error );
        }
    }
}

module.exports = LetGodSortThemOut;
