let factions = require( './data/factionList' );
let exp = {};

for( let faction of Object.keys( factions ) ){
    exp[faction] = require( `./factions/${_.capitalize(faction)}` );
}

module.exports = exp;

