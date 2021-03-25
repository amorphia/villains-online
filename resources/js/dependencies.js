/**
 * Load lodash and it's mixins
 */
window._ = require('lodash');
require( './../js/mixins/lodash_mixins');


/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */
window.axios = require('axios');
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';


/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a convenience so we don't have to attach every token manually.
 */
let getToken = function(){
    // grab our csrf meta tag
    let token = document.querySelector('meta[name="csrf-token"]');

    // if our token has loaded, then apply it otherwise wait 100ms and run this function again
    if ( token?.content && token.content !== 'loading...' ) {
        App.csrf = token.content;
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
    } else {
        setTimeout( getToken, 100 );
    }
};
getToken();


/**
 * Import Vue
 */
window.Vue = require('vue');
Vue.config.devtools = true;


/**
 * Initialize core app object
 */
window.App = window.App || {};


/**
 * Import moment
 */
window.Moment = require('moment');


/**
 * Import VueScrollTo
 */
window.VueScrollTo = require('vue-scrollto');
Vue.use( VueScrollTo, {
    container: "body",
    duration: 500,
    easing: "ease",
    offset: -300,
    force: true,
    cancelable: true,
    onStart: false,
    onDone: false,
    onCancel: false,
    x: false,
    y: true
});

