let helpers = {

    /**
     * Returns faction/influence pairs for each faction's influence in a given area
     *
     * @param area
     * @param factions
     * @param {boolean} withZeros // should we include factions that have zero influence?
     * @returns {object[]} // { factionName : {number} }
     */
    eachInfluenceInArea( area, factions, withZeros ){
        if( area.data ) area = area.data; //format input

        let influences = [];
        // The neutral get 1 influence in its area
        if( area.owner === 'neutral' ) influences.push( { faction : 'neutrals', influence : 1 } );

        Object.values( factions ).forEach( faction =>{
            if( faction.data ) faction = faction.data; //format input

            // get this faction's influence here
            let influence = this.influence( faction, area, factions );

            // add this faction's influence to our array if it's greater than 0, or if we have withZeros set to true
            if( withZeros || influence ) influences.push({ faction : faction.name, influence : influence });
        });

        // sort from highest to lowest
        influences.sort( (a,b) => b.influence - a.influence );
        return influences;
    },


    /**
     * Returns the number of influence a faction has in the given area
     *
     * @param faction
     * @param area
     * @param factions
     * @returns {number}
     */
    influence( faction, area, factions ){
        // format inputs
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        let influence = 0;

        if( area.owner === faction.name ) influence++; // if we currently own the area gain 1
        influence += this.unitInfluence( faction, area ); // get influence from our units
        influence += this.tokenInfluence( faction, factions, area ); // get influence from our tokens
        influence += this.cardInfluence( faction, factions, area ); // get influence from our action cards
        influence += this.cultistKillInfluence( faction, area, factions ); // get cultist kill influence
        influence += this.plantInfluence( faction, area ); // get plant influence

        return influence;
    },


    /**
     * Return's the card influence a given faction has in the given area
     *
     * @param faction
     * @param factions
     * @param area
     * @returns {number}
     */
    cardInfluence( faction, factions, area ){
        let influence = 0;
        let cards = this.getFactionCardCountsInArea( faction, area ); // get the counts of each card type we have played in this area
        let tokens = this.getTokenCounts( faction, area ); // get the token counts of each token we have revealed in this area
        let areaScared = this.areaIsScared( faction, factions, area ); // is this area scared by the ghosts champion?

        // gain 2 influence for each rousing speech
        if( cards['rousing-speech'] ) influence += (2 * cards['rousing-speech']);

        // gain 1 influence for each blown cover
        if( cards['blown-cover'] ) influence += cards['blown-cover'];

        // March the streets gives 2 influence in this area for each deploy token we have revealed
        // (unless tokens produce no influence due to the ghost champion)
        if( !areaScared && cards['march-the-streets'] && tokens['deploy'] ) influence += ( 2 * cards['march-the-streets'] * tokens['deploy'] );

        // Display of Brilliance gives 2 influence in this area for each card token we have revealed
        // (unless tokens produce no influence due to the ghost chmapion)
        if( !areaScared && cards['display-of-brilliance'] && tokens['card'] ) influence += ( 2 * cards['display-of-brilliance'] * tokens['card'] );
        return influence;
    },


    /**
     * Returns the amount of influence the given faction gains in this area from their plants
     *
     * @param faction
     * @param area
     * @returns {number}
     */
    plantInfluence( faction, area ){
        // format input
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        // return the number of plants we have in this area
        return faction.plants?.[area.name] ? faction.plants[area.name] : 0;
    },


    /**
     * Returns the amount of influence a faction gains in an area from their units
     *
     * @param faction
     * @param area
     * @returns {number}
     */
    unitInfluence( faction, area ){
        // format inputs
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        let influence = 0;

        // should this faction gain the benefits of a rise up token?
        let shouldRiseUp = this.shouldRiseUp( faction, area );

        if( !this.areaShouldStandDown( faction, area ) ){ // in areas with a stand down no units produce influence
            if( faction.data ) faction = faction.data; // format input

            // cycle through our units
            faction.units.forEach( unit => {
                if( this.unitInArea( unit, area ) ){ // if this unit is in this area
                    influence += unit.influence; // add its influence to our tally
                    // if we have a rise up then our patsies  also produce an influence
                    if( shouldRiseUp && unit.type === 'patsy' ) influence++;
                }
            });
        }

        return influence;
    },

    /**
     * Should the given faction gain the benefits of a rise up token in this area?
     *
     * @param faction
     * @param area
     * @returns {boolean}
     */
    shouldRiseUp( faction, area ){
        // only the commies have a rise up token
        if( faction.name !== 'commies' ) return false;
        // look for a revealed token named rise-up in this area
        return area.tokens.some( token => token.name === 'rise-up' && token.revealed );
    },


    /**
     * Returns the amount of influence the given faction should gain in this area for the cultist kills ability
     *
     * @param faction
     * @param area
     * @param factions
     * @returns {number}
     */
    cultistKillInfluence( faction, area, factions ){
        // only the cultists can gain this bonus
        if( faction.name !== 'cultists' ) return 0;

        // return the count of our kills in this area
        return this.factionKillCountInArea( faction.name, area.name, factions );
    },


    /**
     * Has this area been scared by the Ghost Champion?
     *
     * @param faction
     * @param factions
     * @param area
     * @returns {boolean}
     */
    areaIsScared( faction, factions, area ){
        // only the ghosts enemies are effected by this ability
        if( faction.name === 'ghosts' || !factions['ghosts'] ) return false;

        // do we have any units with the blockEnemyTokenInfluence ability in this area?
        return factions['ghosts'].units.some( unit => unit.blockEnemyTokenInfluence && !unit.flipped && this.unitInArea( unit, area.name ) );
    },


    /**
     * Returns the total influence a given faction gain in the given area from tokens
     *
     * @param faction
     * @param factions
     * @param area
     * @returns {number}
     */
    tokenInfluence( faction, factions, area ){
        // if the area has been scared for this faction, tokens produce no influence
        if( this.areaIsScared( faction, factions, area ) ) return 0;

        let influence = 0;

        // cycle through each token if this faction has revealed it add its influence to our tally
        area.tokens.forEach( token => {
            if( token.faction === faction.name && token.revealed ){
                influence += token.influence;
            }
        });
        return influence;
    },

};



module.exports = helpers;
