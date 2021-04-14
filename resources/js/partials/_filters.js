/**
 * Apply lodash start case to a string
 */
Vue.filter( 'startCase', function ( value ) {
    if (!value) return '';
    return _.startCase( value );
});


/**
 * Remove hyphens from a string
 */
Vue.filter( 'clearHyphens', function ( value ) {
    if (!value) return '';
    return value.replace( '-', ' ' );
});
