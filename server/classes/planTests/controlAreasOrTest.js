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
        let areaObject = faction.game().areas[ area ];
        let areaController = areaObject ? areaObject.data?.owner : null;
        return areaController === faction.name;
    });


    if( debug ) console.log(
        'controlAreasOr ---',
        'areaName req:', areaNames,
        'result:', result
    );

    return result;
};

module.exports = test;
