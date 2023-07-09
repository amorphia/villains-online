const axios = require( "axios" );

class DB {
    host; // the base url for our laravel DB backend
    trackerHost; // the base url for our external game tracker

    constructor() {
        //if we are on local dev environment set the host to localhost otherwise use our APP_URL in the .env
        this.host = process.env.APP_ENV === 'local' ? 'http://localhost' : process.env.APP_URL;
        this.trackerHost = process.env.VILLAINS_TRACKER_URL;
    }


    /**
     * Create a new game model in the database
     * @param {Game} game
     */
    create( game ){
        let data = {
            uuid: game.id,
            players: Object.keys( game.players )
        };

        axios.post(this.host + '/game', data )
            .then( result => {} )
            .catch( errors => console.log( errors ) );
    }


    /**
     * MArk a game as concluded in the database
     *
     * @param {string} gameId
     */
    conclude( gameId ){
        axios.get(`${this.host}/game/conclude/${gameId}` )
            .then( result => {} )
            .catch( errors => console.log( errors ) );
    }


    /**
     * Save a game state to the database
     *
     * @param {Game} game
     * @param {object} options
     */
    save( game, options = {} ) {
        if( !game || !game.id ) return;

        game.saveNote = options.note;

        let data = {
            type: options.type || 'automatic',
            'active_player' : game.currentPlayerFactionName(),
            action : game.data.gameAction,
            turn : game.data.turn,
            data: JSON.stringify( game )
        };

        axios.post( `${this.host}/save/${game.id}`, data )
            .then( result => {} )
            .catch( errors => console.log( errors ) );
    }


    /**
     * Save the scoring results of a game to our external game tracker
     *
     * @param {Game} game
     * @param {object} scores
     * @param {boolean} incomplete
     */
    track( game, scores, incomplete ) {
        if( !game?.id || !game.data.trackData || !this.trackerHost ) return;

        let data = this.getGameData( game, scores, incomplete );

        axios.post( `${this.trackerHost}/api/import`, data )
            .then( result => {} )
            .catch( errors => console.log( errors ) );
    }


    /**
     * Format game data to prepare it for our external tracker
     *
     * @param {game} game
     * @param {object} scores
     * @param {boolean} incomplete
     * @returns {object}
     */
    getGameData( game, scores, incomplete ){
        return {
            incomplete : incomplete,
            turns : game.data.turn,
            scores : scores,
            win_type : this.getWinType( scores ),
            winner : scores[0],
            cards: game.data.cardTracker,
        };
    }


    /**
     * Determine which type of win type we had (was the game determined by
     * area points, plan points, or both) based on the given scores
     *
     * @param scores
     * @returns {string}
     */
    getWinType( scores ){
        let winner = scores[0];
        if( winner.ap > 12 && winner.pp > 12 ) return 'both';
        if( winner.ap > 12 ) return 'area';
        if( winner.pp > 12 ) return 'plan';
        return 'both';
    }


    /**
     * Return game data from the database
     *
     * @param gameId
     * @returns {object} // game data
     */
    async load( gameId ) {
        let results = await axios.get(`${this.host}/save/${gameId}`).catch( error => console.error( error ) );
        return results.data;
    }

}

module.exports = DB;
