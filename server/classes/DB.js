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
        axios.post(`${this.host}/game/conclude/${gameId}` )
            .then( result => {} )
            .catch( errors => console.log( errors ) );
    }

    save( game, options = {} ) {

        let data = {
            type: options.type || 'automatic',
            data: JSON.stringify( game )
        };

        axios.post( `${this.host}/save/${game.id}`, data )
            .then( result => {} )
            .catch( errors => console.log( errors ) );
    }

    async load( gameId ) {
        let results = await axios.get(`${this.host}/save/${gameId}`);
        return results.data;
    }

}

module.exports = DB;
