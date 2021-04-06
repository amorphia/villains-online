let helpers = {

    killsInArea( factionName, areaName, factions ){
        if( typeof factionName !== 'string' ) factionName = factionName.name;
        if( typeof areaName !== 'string' ) areaName = areaName.name;
        let kills = 0;

        this.forEach( factions, ( faction, name ) => {
            if( name === factionName ) return;
            kills += faction.units.filter( unit => this.factionKilledUnitHere( factionName, unit, areaName ) ).length;
        });

        return kills;
    },

    factionKilledUnitHere( faction, unit, area ){
        if( typeof faction !== 'string' ) faction = faction.name;
        if( typeof area !== 'string' ) area = area.name;
        return unit.killed === faction && unit.location === area;
    },

    areaExterminated( area, factions ){
        if( area.data ) area = area.data;

        let suitcaseNuke = _.find( area.cards, card => card.class === 'suitcase-nuke' );
        if( suitcaseNuke ) return suitcaseNuke.owner;

        let factionsWithUnitsHere = [];
        let factionsWithNonHiddenUnitsHere = [];
        _.forEach( factions, (faction, name) => {
            if( faction.data ) faction = faction.data;
            if( faction.units.some( unit => this.unitInArea( unit, area ) ) ) factionsWithUnitsHere.push( name );
            if( faction.units.some( unit => this.unitInArea( unit, area, { notHidden: true } ) ) ) factionsWithNonHiddenUnitsHere.push( name );
        });

        // if only one player has units here (including hidden units), and that player has a kill they have scored an exterminate
        if( factionsWithUnitsHere.length === 1 && this.killsInArea( factionsWithUnitsHere[0], area.name, factions ) > 0 ){
            return factionsWithUnitsHere[0];
        }

        // if multiple players have units here, but only one has non-hidden units and they have a kill, that player has scored an exterminate
        if( factionsWithNonHiddenUnitsHere.length === 1 && this.killsInArea( factionsWithNonHiddenUnitsHere[0], area.name, factions ) > 0 ){
            return factionsWithNonHiddenUnitsHere[0];
        }

    },



    factionTypesKilled( faction, factions ){
        let types = {};

        let kills = this.factionKills( faction, factions );
        kills.forEach( unit => {
            if( types.hasOwnProperty( unit.type ) ) types[unit.type]++;
            else types[unit.type] = 1;
        });

        return Object.keys( types ).length ? types : false;
    },


    allKilledUnitsInAreaByFaction( areaName, factions ){
        if( typeof areaName !== 'string' ) areaName = areaName.name;
        let areaDead = {};
        this.forEach( factions, faction => {
            faction.units.forEach( unit => {
                if( unit.location === areaName && unit.killed ){
                    if( areaDead.hasOwnProperty( unit.killed ) ){
                        areaDead[unit.killed].push( unit );
                    } else {
                        areaDead[unit.killed] = [unit];
                    }
                }
            });
        });
        return areaDead;
    },

    factionKills( faction, factions ){
        let kills = [];

        _.forEach( factions, fac => {
            if( fac.name === faction.name ) return;

            fac.units.forEach( unit => {
                if( unit.killed === faction.name ){
                    kills.push( unit );
                }
            })
        });

        return kills;
    },



    factionKillsInEnemy( faction, factions, areas, areaLeaders = false ){
        let enemyAreas = this.determineEnemyAreas( faction, factions, areas, areaLeaders );

        return this.factionKills( faction, factions ).filter( unit => enemyAreas.includes( unit.location ) );
    },



};



module.exports = helpers;
