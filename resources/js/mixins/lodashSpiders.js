let helpers = {

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

};



module.exports = helpers;
