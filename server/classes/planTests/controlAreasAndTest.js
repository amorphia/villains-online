/**
 * Does this faction control the specified area?
 *
 * @param debug
 * @param faction
 * @param areaNames
 * @returns {boolean}
 */
const test = function controlAreasAnd( debug, faction, areaNames ) {
    let result = areaNames.every( area => {
        let areaObject = faction.game().areas[ area ];
        let areaController = areaObject ? areaObject.data?.owner : null;
        return areaController === faction.name;
    });


    if( debug ) console.log(
        'controlAreasAnd ---',
        'areaName req:', areaNames,
        'result:', result
    );

    return result;
};

module.exports = test;
