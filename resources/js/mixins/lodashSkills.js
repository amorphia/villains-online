let helpers = {

    hasUsedSkill( faction, area ){
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;
        return faction.usedSkills.includes( area )
    },


    canUseMagick( faction, area, factions ){

        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        if( faction.name !== 'witches') return;

        if( faction.units.find( unit => this.unitInArea( unit, area ) && unit.flipped ) ) return true;

    },

    canUseSkill( faction, area, factions ){
        if( faction.data ) faction = faction.data;
        if( area.data ) area = area.data;

        if( this.hasUsedSkill( faction, area ) ) return;

        if( faction.units.find( unit => this.unitReadyInArea( unit, area ) ) ) return true;

        /*
        // Zero Day special ability
        if( faction.name === 'hackers'
            && faction.units.find( unit => this.unitInArea( unit, area ) && unit.type === 'champion' )
        ){
            for( let fac of Object.values( factions ) ){
                if( fac.name === faction.name ) continue;
                if( fac.units.find( unit => this.unitReadyInArea( unit, area ) && unit.basic ) ) return true;
            }
        }
        */
    },

    unitReady( unit ){
        return !unit.killed && unit.ready && unit.location;
    },

    unitReadyInArea( unit, area ){
        if( typeof area !== 'string' ) area = area.name;
        return unit.location === area && !unit.killed && unit.ready;
    },

    unitNotReadyInArea( unit, area ){
        if( typeof area !== 'string' ) area = area.name;
        return unit.location === area && !unit.killed && !unit.ready;
    },


};



module.exports = helpers;
