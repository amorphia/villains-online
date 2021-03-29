let Card = require( './Card' );

class Despotism extends Card {
    async handle( faction ){
        let areas = faction.areas();
        for( let index in faction.areas() ){
            let area = faction.game().areas[areas[index]];
            faction.game().message({ faction: faction, message:  `the mad despot launches an attack in the ${area.name}` });
            await faction.nonCombatAttack(5, 3, area ).catch( error => console.error( error ) );
        }
    }
}

module.exports = Despotism;
