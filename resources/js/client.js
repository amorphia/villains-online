/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./dependencies');

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */


const files = require.context('./components', true, /\.vue$/i);
files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default));


window.App = window.App || {};

/**
 *
 * Import partials
 *
 */
require( './partials/_ajax' ); // ajax helper
require( './partials/_onload' ); // onload helper
require( './partials/_ifCsrf' ); // set ifCsrf handler
require( './partials/_helpers' ); // set up shared state
require( './partials/_state' ); // set up shared state
require( './partials/_event' ); // Event emitter
require( './partials/_cookies' ); // Cookie handler
require( './partials/_filters' ); // filters
require( './partials/_drag' ); // drag directive
require( './partials/_preload' ); // image preloader

const VueApp = new Vue({
    el: '#app',
});
