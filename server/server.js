/**
 * Utilities
 */
global._ = require( 'lodash' );
const { v4: uuid4 } = require( 'uuid' );
global.uuid = uuid4;


_.mixin( require( './partials/helpers') );


/**
 * Set Up Server
 */
const port = 6001;
const express = require( 'express' )();
const cors = require( 'cors' );

express.use( cors() );


const server = require( 'http' ).Server( express );
const io = require( 'socket.io' )( server );
global.Server = require('./classes/Server')( server, io );


Server.server.listen( port );

process.on('uncaughtException', ( error) => console.log( error ) );
console.log( "Websockets listening on port :" + port );





