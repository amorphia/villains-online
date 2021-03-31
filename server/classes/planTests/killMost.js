/**
 * Has this faction killed more units than any other player?
 *
 * @param debug
 * @param faction
 * @returns {boolean}
 */
const test = function killMost( debug, faction ){
    let killCounts = Object.values( faction.game().factions )
        .map( item => {
            return { name : item.name, kills : item.kills().length }
        });

    killCounts.sort( (a,b) => b.kills - a.kills );

    let result = killCounts[0].kills // there was at least one kill
        && killCounts[0].name === faction.name // our number of kills puts us at the top of the sort
        && killCounts[0].kills !== killCounts[1].kills; // and there isn't a tie

    if( debug ) console.log(
        'killMost',
        'killCounts[0]:',killCounts[0],
        'result:', result
    );

    return result;
};

module.exports = test;
