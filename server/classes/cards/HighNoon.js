let Card = require( './Card' );

class HighNoon extends Card {
    async handle( faction, area ) {
        let player = {}, data = {};

        // get our unit types
        let unitTypes = {};
        faction.data.units.forEach(unit => {
            if (!unit.location && unit.basic) unitTypes[unit.type] = true;
        });
        unitTypes = Object.keys(unitTypes);

        if (!unitTypes.length) {
            faction.game().message({
                faction: faction,
                message: 'High Noon cannot be resolved (no basic units in your reserves)',
                class: 'warning'
            });
            return;
        }

        let enemies = [];
        // get enemies with at least one matching unit type
        _.forEach( faction.game().factions, enemy => {
            if ( enemy.name === faction.name || enemy.data.hiddenReserves ) return;

            let matchingUnit = _.find(enemy.data.units, unit => {
                return !unit.location && unitTypes.includes(unit.type);
            });

            if (matchingUnit) enemies.push(enemy.name);
        });


        if (!enemies.length) {
            faction.game().message({
                faction: faction,
                message: 'High Noon cannot be resolved (no matching basic units in enemy reserves)',
                class: 'warning'
            });
            return;
        }

        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'high-noon',
            data: {
                area: area.name,
                types: unitTypes,
                enemies: enemies
            }
        }).catch( error => console.error( error ) );

        let units = data.units.map(id => faction.game().objectMap[id]);

        for( let unit of units ){
            let deployFaction = faction.game().factions[unit.faction];
            await deployFaction.processDeploy( deployFaction.playerId, {
                cost: 0,
                units: [unit.id],
                toArea: area.name,
                hidePrompt : true
            }).catch( error => console.error( error ) );
        }

        await faction.game().timedPrompt('units-shifted', {
            message: `The ${faction.name} place units in the ${area.name}`,
            units: units
        }).catch( error => console.error( error ) );
    }
}

module.exports = HighNoon;
