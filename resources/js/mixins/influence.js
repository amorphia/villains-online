let helpers = {

    eachInfluenceInArea( area, factions, withZeros ){
        let influences = [];
        if( area.owner === 'neutral' ) influences.push( { faction : 'neutrals', influence : 1 } );

        this.forEach( factions, faction => {
            let influence = this.influence( faction, area, factions );
            if( withZeros || influence ) influences.push({ faction : faction.name, influence : influence });
        });

        influences.sort( (a,b) => b.influence - a.influence );
        return influences;
    },

    influence( faction, area, factions ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        let influence = 0;

        if( area.owner === faction.name ) influence++;
        influence += this.unitInfluence( faction, area );
        influence += this.tokenInfluence( faction, factions, area );
        influence += this.cardInfluence( faction, factions, area );
        influence += this.churchInfluence( faction, area, factions );
        influence += this.plantInfluence( faction, area );
        return influence;
    },


    cardInfluence( faction, factions, area ){
        let influence = 0;
        let cards = this.getCardCounts( faction, area );
        let tokens = this.getTokenCounts( faction, area );
        let areaScared = this.areaIsScared( faction, factions, area );

        if( cards['rousing-speech'] ) influence += (2 * cards['rousing-speech']);
        if( cards['blown-cover'] ) influence += cards['blown-cover'];
        if( !areaScared && cards['march-the-streets'] && tokens['deploy'] ) influence += ( 2 * cards['march-the-streets'] * tokens['deploy'] );
        if( !areaScared && cards['display-of-brilliance'] && tokens['card'] ) influence += ( 2 * cards['display-of-brilliance'] * tokens['card'] );
        return influence;
    },


    plantInfluence( faction, area ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        if( faction.name !== 'plants' ) return 0;
        return faction.plants[area.name] ? faction.plants[area.name] : 0;
    },


    unitInfluence( faction, area ){
        if( faction.data ) faction = faction.data; if( area.data ) area = area.data;

        let influence = 0;
        let shouldRiseUp = this.shouldRiseUp( faction, area );

        if( !this.shouldStandDown( faction, area ) ){
            if( faction.data ) faction = faction.data;
            faction.units.forEach( unit => {
                if( this.unitInArea( unit, area ) ){
                    influence += unit.influence;
                    if( shouldRiseUp && unit.type === 'patsy' ) influence++;
                }
            });
        }

        return influence;
    },

    shouldRiseUp( faction, area ){
        if( faction.data ) faction = faction.data; if( area.data ) area = area.data;

        if( faction.name !== 'commies' ) return false;
        return !!this.find( area.tokens, token => token.name === 'rise-up' && token.revealed );
    },

    churchInfluence( faction, area, factions ){
        if( faction.name !== 'cultists' ) return 0;
        return this.killsInArea( faction.name, area.name, factions );
    },


    areaIsScared( faction, factions, area ){
        if( faction.name === 'ghosts' || !factions['ghosts'] ) return false;
        return factions['ghosts'].units.some( unit => unit.blockEnemyTokenInfluence && this.unitInArea( unit, area.name ) );
    },

    tokenInfluence( faction, factions, area ){
        if( this.areaIsScared( faction, factions, area ) ) return 0;

        let influence = 0;
        area.tokens.forEach( token => {
            if( token.faction === faction.name && token.revealed ){
                influence += token.influence;
            }
        });
        return influence;
    },

};



module.exports = helpers;
