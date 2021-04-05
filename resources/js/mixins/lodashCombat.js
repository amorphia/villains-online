let helpers = {

    assignableHits( units, options = {} ){
        let assignableHits = 0;
        units.forEach( unit => {
            if( !unit.hidden && ( !options.nonPatsy || unit.type !== 'patsy' ) ){
                assignableHits += ( unit.toughness && !unit.flipped )
                || (unit.flipped && unit.faction === 'vampires' && unit.type === 'champion') ? 2 : 1;
                assignableHits -= unit.hits ? unit.hits : 0;
            }
        });
        return assignableHits;
    },


    calculateDefenseBonus( attackingFaction, targetFaction, area, options = {} ){
        if( attackingFaction.data ) attackingFaction = attackingFaction.data;
        if( targetFaction.data ) targetFaction = targetFaction.data;
        if( area.data ) area = area.data;

        let defenseBonus = 0;
        if( ! options.unit ) return defenseBonus;

        if( targetFaction.defenseBonus ){
            defenseBonus += targetFaction.defenseBonus;
            if( options.debug ) console.log( 'Apply targetFaction.defenseBonus defense bonus:', defenseBonus  );
        }

        if( targetFaction.name === 'mutants' && _.find( area.tokens, token => token.revealed && token.name === 'biohazard') ){
            defenseBonus += 2;
            if( options.debug ) console.log( 'Apply bioHazard defense bonus:', defenseBonus  );
        }

        if( targetFaction.factionDefenseBonus ){
            defenseBonus += targetFaction.factionDefenseBonus;
            if( options.debug ) console.log( 'Apply targetFaction.factionDefenseBonus defense bonus:', defenseBonus  );
        }

        if( options.debug ) console.log( 'Final defense bonus:', defenseBonus  );
        return defenseBonus;
    },

};



module.exports = helpers;
