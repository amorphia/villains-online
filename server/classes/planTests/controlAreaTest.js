/**
 * Does this faction control the specified area?
 *
 * @param debug
 * @param faction
 * @param areaName
 * @returns {boolean}
 */
const test = function controlArea( debug, faction, areaName ) {
    let areaController = faction.game().areas[ areaName ].data.owner;
    let result = areaController === faction.name;

    if( debug ) console.log(
        'controlArea ---',
        'areaName req:', areaName,
        'areaController:', areaController,
        'result:', result
    );

    return result;
};

module.exports = test;
