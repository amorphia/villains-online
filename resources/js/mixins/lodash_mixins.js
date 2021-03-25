/**
 * Mixins to merge with lodash
 */
let mixins = [
    'general',
    'faction',
    'combat',
    'tokens',
    'skills',
    'units',
    'areas',
    'influence',
    'kills',
];

/**
 * Do the mergin'
 */
mixins.forEach( mixin => _.mixin( require( './' + mixin ) ) );
module.exports = {};
