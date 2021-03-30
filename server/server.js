/**
 *
 * Load various utilities
 *
 */

// all hail lodash
global._ = require( 'lodash' );

// add my custom lodash mixins
_.mixin( require( '../resources/js/mixins/lodash_mixins') );

// load path helper
const path = require('path');

// set our .env to be the one in our laravel root
require('dotenv').config( { path: path.resolve(__dirname, '../.env') } );

// load UUID generator
const { v4: uuid4 } = require( 'uuid' );
global.uuid = uuid4;


/**
 *
 * Set Up Server
 *
 */

// set our port
const port = 6001;

// require express
const express = require( 'express' )();

// require cors package for express
const cors = require( 'cors' );
express.use( cors() );

// set up express server
const expressServer = require( 'http' ).Server( express );

// set up socket.io
const io = require( 'socket.io' )( expressServer );

// instantiate a global variable that holds an instance of my Server class
global.Server = require('./classes/Server')( expressServer, io );

// start listening
Server.listen( port );

// catch unhandled exceptions
process.on('uncaughtException', ( error) => console.log( error ) );

// log that we are up and running
console.log( "Websockets listening on port :" + port );





