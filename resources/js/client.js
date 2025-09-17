/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries.
 */
require('./dependencies');


/**
 * Automatically register our Vue components globally. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 */
const files = require.context('./components', true, /\.vue$/i);
files.keys().map( key => Vue.component( key.split('/').pop().split('.')[0], files( key ).default ) );



/**
 * Import our partials and helpers
 */
require( './partials/_ajax' ); // ajax helper
require( './partials/_state' ); // set up shared state
require( './partials/_event' ); // Event emitter
require( './partials/_cookies' ); // Cookie handler
require( './partials/_filters' ); // filters
require( './partials/_drag' ); // drag directive
require( './partials/_preload' ); // image preloader


/**
 * Start core Vue instance
 */
const VueApp = new Vue({
    el: '#app',
});
