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
        let areaController = faction.game().areas[ area ].data?.owner;
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
