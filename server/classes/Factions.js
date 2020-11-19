let factions = require( './data/factionList' );

// Build our export object collecting each faction class using the list of faction names
let exportFactions = {};
for( let faction of Object.keys( factions ) ){
    exportFactions[faction] = require( `./factions/${_.capitalize(faction)}` );
}

module.exports = exportFactions;

