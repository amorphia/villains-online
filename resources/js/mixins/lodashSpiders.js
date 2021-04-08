let helpers = {

    /**
     * Returns a tally of the total units the spiders have trapped in webs, and how many from each faction are webbed
     *
     * @param spiders
     * @param factions
     * @returns {{total: {number}, factions: { name : {number}, name : {number} } } }
     */
    webbedTotals( spiders, factions ){
        if( spiders.data ) spiders = spiders.data; // format data
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


    /**
     * Return our webbed units filtered by our options
     *
     *
     * @param spiders
     * @param options
     * @returns {Unit[]}
     */
    webbedUnits( spiders, options = {} ){
        if( spiders.data ) spiders = spiders.data; // format data
        let webbed = spiders.webs;

        // filter by areas
        if( options.area ){
            let area = typeof options.area === 'string' ?  options.area : options.area.name; // format input
            webbed = webbed.filter( unit => unit.location === area );
        }

        if( options.faction ){
            let faction = typeof options.faction === 'string' ?  options.faction : options.faction.name; // format input
            webbed = webbed.filter( unit => unit.faction === faction );
        }

        return webbed;
    },

};

module.exports = helpers;
