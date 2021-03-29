let Card = require( './Card' );

class AllHollowsEve extends Card {

    async handle( faction, area ){
        let player, data;
        let reviveCount = 4;
        let units = [];
        let areas = {};

        // get areas where we have killed units
        faction.data.units.forEach( unit => {
            if( unit.killed && unit.location ){
                areas[unit.location] = true;
            }
        });
        areas = Object.keys( areas );

        if( !areas.length ){
            faction.game().message({ message : 'No killed units to revive', class : 'warning' });
            return;
        }


        // let player choose their next unit
        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-units',
            data : {
                count : reviveCount,
                optionalMax: true,
                areas : areas,
                playerOnly : true,
                killedOnly : true,
                message: `Choose up to ${reviveCount} units killed to revive`,
            }
        }).catch( error => console.error( error ) );

        // no unit selected? Welp, guess we are done here
        if( !data.units ){
            faction.game().message({ message : 'Declines to revive any units', class : 'warning' });
            return;
        }

        units = data.units.map( unitId => faction.game().objectMap[unitId] );

        units.forEach( unit => {
            unit.killed = false;
            if( unit.ready ) unit.ready = false;
            if( unit.flipped ) faction.unflipUnit( unit );
        });


        await faction.game().timedPrompt('units-shifted', {
            message: `The ${faction.name} returns killed units to play`,
            units: units
        }).catch( error => console.error( error ) );

    }
}

module.exports = AllHollowsEve;
