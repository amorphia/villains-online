const axios = require( "axios" );

class DB {

    host;
    prodHost = 'https://playvillains.jeremykalgreen.com';
    localHost = "http://localhost";

    constructor() {
        if( process.env.HOMEPATH ===  '\\Users\\jerem' ){
            this.host = this.localHost;
        } else {
            this.host = this.prodHost;
        }
    }

    create( game ){

        let data = {
            uuid: game.id,
            players: Object.keys( game.players )
        };

        axios.post(this.host + '/game', data )
            .then( result => {} )
            .catch( errors => console.log( errors ) );
    }

    conclude( gameId ){
        axios.get(`${this.host}/game/conclude/${gameId}` )
            .then( result => {} )
            .catch( errors => console.log( errors ) );
    }

    save( game, options = {} ) {


        let data = {
            type: options.type || 'automatic',
            active : game.currentPlayerFactionName(),
            action : game.data.gameAction,
            turn : game.data.turn,
            data: JSON.stringify( game )
        };

        if( !game || !game.id ) return;
        axios.post( `${this.host}/save/${game.id}`, data )
            .then( result => {} )
            .catch( errors => console.log( errors ) );
    }

    async load( gameId ) {
        console.log( 'loading game' );
        let results = await axios.get(`${this.host}/save/${gameId}`).catch( error => console.error( error ) );
        return results.data;
    }

}

module.exports = DB;
