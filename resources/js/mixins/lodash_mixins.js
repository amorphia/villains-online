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
    'lodashSpiders',
];

/**
 * Do the mergin'
 */
mixins.forEach( mixin => _.mixin( require( './' + mixin ) ) );
module.exports = {};
