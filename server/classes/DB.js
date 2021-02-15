const axios = require( "axios" );

class DB {

    host;
    prodHost = 'https://playvillains.jeremykalgreen.com';
    localHost = "http://localhost";
    prodTrackerHost = 'https://villains.jeremykalgreen.com';
    localTrackerHost = "http://villains.localhost";

    constructor() {
        if( process.env.HOMEPATH ===  '\\Users\\jerem' ){
            this.host = this.localHost;
            this.trackerHost = this.localTrackerHost;
        } else {
            this.host = this.prodHost;
            this.trackerHost = this.prodTrackerHost;
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
        console.log( 'save game' );

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


    track( game, scores, incomplete ) {
        if( !game || !game.id ) return;


        let data = this.getGameData( game, scores, incomplete );
        console.log( 'track game', data );

        axios.post( `${this.trackerHost}/api/import`, data )
            .then( result => {} )
            .catch( errors => console.log( errors ) );
    }


    getGameData( game, scores, incomplete ){
        return {
            incomplete : incomplete,
            turns : game.data.turn,
            scores : scores,
            win_type : this.getWinType( scores ),
            winner : scores[0]
        };
    }

    getWinType( scores ){
        let winner = scores[0];
        if( winner.ap > 12 && winner.pp > 12 ) return 'both';
        if( winner.ap > 12 ) return 'area';
        if( winner.pp > 12 ) return 'plan';
        return 'both';
    }


    async load( gameId ) {

        console.log( 'loading game' );
        let results = await axios.get(`${this.host}/save/${gameId}`).catch( error => console.error( error ) );
        return results.data;
    }

}

module.exports = DB;
