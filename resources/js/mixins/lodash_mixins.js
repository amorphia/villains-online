/**
 * Mixins to merge with lodash
 */
let mixins = [
    'lodashGeneral',
    'lodashFaction',
    'lodashCombat',
    'lodashTokens',
    'lodashSkills',
    'lodashUnits',
    'lodashAreas',
    'lodashInfluence',
    'lodashKills',
];

/**
 * Do the mergin'
 */
mixins.forEach( mixin => _.mixin( require( './' + mixin ) ) );
module.exports = {};
