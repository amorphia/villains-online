let Card = require( './Card' );

class ToTheDeath extends Card {
    async handle( faction, area ){
        let keepFighting = true;

        while( keepFighting ){

            // battle
            await faction.game().battle( area ).catch( error => console.error( error ) );

            keepFighting = false;

            // see if any player wants to continue
            if( area.canBattle() ){
                let factions = area.factionsWithUnits();

                // ask each player if they want to fight
                let promises = [];

                for( let item of factions ) {
                    let currentFaction = faction.game().factions[item];

                    promises.push( faction.game().promise({
                        players: currentFaction.playerId,
                        name: 'question',
                        data : { message : `Continue battling in the ${area.name}?` }
                    }).then( ([player, data]) => {
                        if( data.answer === true ){
                            keepFighting = true;
                            faction.game().message({ message : `The ${item} are still hungry for blood`, class : 'highlight' });
                        } else {
                            faction.game().message({ message : `The ${item} have had enough bloodshed`, class : 'warning' });
                        }
                        player.setPrompt({ active : false, updatePlayerData : true });
                    }));
                }

                await Promise.all( promises );
            }
        }
    }
}

module.exports = ToTheDeath;
