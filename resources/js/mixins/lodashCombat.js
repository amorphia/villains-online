let helpers = {

    /**
     * Returns the number of hits we are able to assign to the given units
     *
     * @param units
     * @param options
     * @returns {number}
     */
    assignableHits( units, options = {} ){
        let assignableHits = 0;

        units.forEach( unit => {
            // ignore units that can't be assigned hits
            if( unit.hidden || ( options.nonPatsy && unit.type === 'patsy' ) ) return;

            // units with toughness that have't taken a hit yet can be assigned two hits
            if( ( unit.toughness || unit.hasOwnProperty( 'skeleton' ) ) && !unit.flipped ) {
                assignableHits += 2;
                return;
            }

            // prepared units can be assigned two hits
            if( unit.prepared ) {
                assignableHits += 2;
                return;
            }

            // other units can be assigned one hit
            assignableHits++;
        });

        return assignableHits;
    },


    /**
     * Calculate a faction's defense bonus
     *
     * @param attackingFaction
     * @param defendingFaction
     * @param area
     * @param options
     * @returns {number}
     */
    calculateDefenseBonus( attackingFaction, defendingFaction, area, options = {} ){
        // format inputs
        if( attackingFaction.data ) attackingFaction = attackingFaction.data;
        if( defendingFaction.data ) defendingFaction = defendingFaction.data;
        if( area.data ) area = area.data;

        let defenseBonus = 0;

        // defense bonuses only apply to attacks from units
        if( !options.unit ) return defenseBonus;

        // if the defending faction has a basic defense bonus apply it
        if( defendingFaction.defenseBonus ) defenseBonus += defendingFaction.defenseBonus;

        if( defendingFaction.defenseBonus ) defenseBonus += defendingFaction.defenseBonus;

        // if the defending player has a biohazard token they gain +2 defense
        if( this.hasBiohazardInArea( defendingFaction, area ) ) defenseBonus += 2;

        let soloDefenseBonus = this.soloDefenseBonus( defendingFaction, area );
        if( soloDefenseBonus ) defenseBonus += soloDefenseBonus;

        // if the defending player has a special faction defense bonus apply it
        if( defendingFaction.factionDefenseBonus ) defenseBonus += defendingFaction.factionDefenseBonus;

        return defenseBonus;
    },

    soloDefenseBonus( defendingFaction, area ){
        let defendingUnits = this.factionUnitsInArea(defendingFaction, area);
        console.log("soloDefenseBonus defendingUnits", defendingUnits );
        console.log("defendingUnits.count === 1", defendingUnits.length === 1 );
        console.log("defendingUnits[0].soloDefenseBonus", defendingUnits[0].soloDefenseBonus );

        if(defendingUnits.length === 1 && defendingUnits[0].soloDefenseBonus) return defendingUnits[0].soloDefenseBonus;
    },

    /**
     * Does this faction have a revealed biohazard token in the area?
     *
     * @param faction
     * @param area
     * @returns {boolean}
     */
    hasBiohazardInArea( faction, area ) {
        if( area.data ) area = area.data; // format inputs

        // if we aren't the mutants, then nope
        if( faction.name !== 'mutants' ) return false;

        // check for the token
        return area.tokens.some( token => token.name === 'biohazard' && token.revealed );
    }

};



module.exports = helpers;
