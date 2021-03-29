let areas = [
    'capitol',
    'sewers',
    'police',
    'laboratory',
    'factory',
    'bank',
    'university',
    'subway',
    'church'
];

// Build our export object collecting each area class using the list of area names
let exportAreas = {};
areas.forEach( area => exportAreas[area] = require( `./areas/${_.startCase( area )}` ) );

module.exports = exportAreas;


