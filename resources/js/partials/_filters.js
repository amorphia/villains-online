Vue.filter( 'startCase', function ( value ) {
    if (!value) return '';
    return _.startCase( value );
});

Vue.filter( 'clearHyphens', function ( value ) {
    if (!value) return '';
    return value.replace( '-', ' ' );
});
