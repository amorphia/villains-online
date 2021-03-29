let Card = require( './Card' );

class SuitcaseNuke extends Card {
    async handle( faction, area ){
        let player = {}, data = {};

        // can we sacrifice a unit
        if( !_.find( faction.data.units, unit => _.unitInArea( unit, area ) ) ){
            faction.game().message({ faction : faction, message: "don't have a unit to sacrifice to suitcase nuke", class : 'warning' });
            _.remove( area.data.cards, card => card.class === 'suitcase-nuke' );
            return;
        }

        // do we want to sacrifice a unit
        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'sacrifice-units',
            data : {
                count : 1,
                areas : [area.name],
                optional : true
            }
        });

        if( !data.units.length ){
            faction.game().message({ faction : faction, message: "chose not to activate the suitcase nuke", class : 'text' });
            _.remove( area.data.cards, card => card.class === 'suitcase-nuke' );
            return;
        }

        //
        //
        // BOOOOOOOOOOM!
        //
        //

        faction.game().sound( 'explosion' );

        // lose control of area
        if( area.data.owner ){
            if( area.data.owner === 'neutral' ){
                area.data.owner = null;
            } else {
                let owner = faction.game().factions[ area.data.owner ];
                owner.loseControlOfArea( area );
            }
        }

        // remove all tokens
        area.data.tokens.forEach( token => {
            token.location = null;
            token.revealed = false;
        });
        area.data.tokens = [];

        // kill all units
        for( let fac of Object.values( faction.game().factions ) ){
            for( let unit of fac.data.units ) {
                if( _.unitInArea( unit, area ) ){
                    await faction.game().killUnit( unit, faction );
                }
            }
        }
    }
}

module.exports = SuitcaseNuke;
