let helpers = {

    factionUnitsInArea( faction, area, options = {} ){
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;
        return faction.units.filter( unit => this.unitInArea( unit, area, options ) );
    },


    hasUnitsInArea( faction, area, options = {} ){
        if( faction.data ) faction = faction.data;
        if( typeof area !== 'string' ) area = area.name;

        return !! this.find( faction.units, unit => {
            return _.unitInArea( unit, area, options );
        });
    },


    factionsWithUnitsInArea( factions, area, args ){
        if( typeof area !== 'string' ) area = area.name;
        let factionsWithUnits = [];

        _.forEach( factions, (faction, name) => {
            let exclude = false;

            if( args.exclude ){
                if( Array.isArray( args.exclude ) && args.exclude.includes( name ) ) exclude = true;
                else if( args.exclude === name ) exclude = true;
            }

            if( this.hasUnitsInArea( faction, area, { basic : args.basic, notHidden : args.notHidden, types : args.types } ) && ! exclude ){
                factionsWithUnits.push( name );
            }
        });

        return factionsWithUnits;
    },

    deadInArea( unit, area ){
        if( typeof area !== 'string' ) area = area.name;
        return unit.location === area && unit.killed;
    },

    webbedTotals( spiders, factions ){
        if( spiders.data ) spiders = spiders.data;
        let webbed = spiders.webs;

        let output = {
            total : webbed.length,
            factions : {}
        };

        // set factions properties
        Object.values( factions ).forEach( faction => {
            if( faction.name === 'spiders' ) return;
            output.factions[ faction.name ] = 0;
        });

        webbed.forEach( unit => { output.factions[ unit.faction ]++ });

        return output;
    },

    webbedUnits( spiders, options = {} ){
        if( spiders.data ) spiders = spiders.data;
        let webbed = spiders.webs;

        if( options.area ){
            let area = options.area;
            if( typeof area !== 'string') area = area.name;
            webbed = webbed.filter( unit => unit.location === area );
        }

        if( options.faction ){
            let faction = options.faction;
            if( typeof faction !== 'string') faction = faction.name;
            webbed = webbed.filter( unit => unit.faction === faction );
        }

        return webbed;
    },


    unitInArea( unit, area, options = {} ){
        if( typeof area !== 'string' ) area = area.name;

        return unit.location === area
            && !unit.killed
            && ( !options.basic || unit.basic )
            && ( !options.flipped || unit.flipped )
            && ( !options.skilled || unit.skilled )
            && ( !options.type || options.type === unit.type )
            && ( !options.types || options.types.includes( unit.type ) )
            && ( !options.notHidden || !unit.hidden );
    },


    enemyUnitsInArea( faction, area, factions, options = {} ){
        if( faction.data ) faction = faction.data;
        let units = {};

        _.forEach( factions, fac => {
            if( fac.name === faction.name ) return;
            let factionUnits = _.factionUnitsInArea( fac, area, options );

            if( options.basic ) factionUnits = factionUnits.filter( unit => unit.basic );
            if( options.notHidden ) factionUnits = factionUnits.filter( unit => ! unit.hidden );

            if( factionUnits.length ){
                units[fac.name] = factionUnits;
            }
        });
        return units;
    },



    factionEnemyInAreasCount( faction, factions, areas, areaLeaders = false ){
        let winningAreas = [];
        let count = 0;

        if( areaLeaders ){
            winningAreas = this.factionWinningAreas( faction, factions, areas, areaLeaders );
        } else {
            Object.values( areas ).forEach( area => {
                if( area.owner === faction.name ) winningAreas.push( area.name );
            });
        }

        Object.values( factions ).forEach( fac => {
            if( fac.name === faction.name ) return;
            count += fac.units.filter( unit => winningAreas.includes( unit.location ) && !unit.killed ).length;
        });

        return count;
    },

    unitsInPlay( faction ){
        if( faction.data ) faction = faction.data;
        return faction.units.filter( unit => this.unitInPlay( unit ) );
    },

    unitInReserves( unit ){
        return !unit.location && !unit.killed;
    },

    unitInPlay( unit ){
        return unit.location && !unit.killed;
    },

    unitTypesInEnemy( faction, factions, areas, areaLeaders = false ){
        let enemyAreas = this.determineEnemyAreas( faction, factions, areas, areaLeaders );
        let typesInEnemy = {};

        faction.units.forEach( unit => {
            if( !enemyAreas.includes( unit.location ) ) return;

            if( !typesInEnemy[unit.type] ) typesInEnemy[unit.type] = 1;
            else typesInEnemy[unit.type]++;
        });

        return typesInEnemy;
    },

};



module.exports = helpers;
