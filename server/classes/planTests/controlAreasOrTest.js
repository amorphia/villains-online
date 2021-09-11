/**
 * Does this faction control one of the specified areas?
 *
 * @param debug
 * @param faction
 * @param areaNames
 * @returns {boolean}
 */
const test = function controlAreasOr( debug, faction, areaNames ) {
    let result = areaNames.some( area => {
        let areaController = faction.game().areas[ area ].data.owner;
        return areaController === faction.name;
    });


    if( debug ) console.log(
        'controlAreasOr',
        'areaName req:', areaNames,
        'result:', result
    );

    return result;
};

module.exports = test;
