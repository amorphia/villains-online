let helpers = {

    factionIcon( faction ){
        if( typeof faction !== 'string' ) faction = faction.name;
        return `/images/factions/${faction}/icon.jpg`;
    },

    money( faction, darkEnergy = false ){
        if( faction.data ) faction = faction.data;

        let money = faction.resources + faction.energy;
        if( darkEnergy && faction.hasOwnProperty( 'darkEnergy' ) ) money += faction.darkEnergy;

        return money;
    },

    rulesPlayed( faction, areas ){
        if( faction.data ) faction = faction.data;

        let rules = {
            total : faction.cards.active.length,
            areas : 0,
            stack : 0,
        };

        let globalAreas = {};

        for( let card of faction.cards.active ){
            if( globalAreas[card.playedIn] ) globalAreas[card.playedIn]++;
            else globalAreas[card.playedIn] = 1;
        }

        for( let area of Object.values( areas ) ){
            let areaRules = area.cards.filter( card => card.owner === faction.name );
            if( areaRules.length ) {
                rules.total += areaRules.length;
                if( globalAreas[area.name] ) globalAreas[area.name] += areaRules.length;
                else globalAreas[area.name] = areaRules.length;
            }
        }

        rules.areas = Object.keys( globalAreas ).length;
        console.log( Object.keys( globalAreas ) );
        globalAreas = Object.values( globalAreas );

        if( globalAreas.length ){
            rules.stack = globalAreas.reduce( (val, n) => val > n ? val : n );
        }

        return rules;
    }

};



module.exports = helpers;
