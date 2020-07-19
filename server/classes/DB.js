const SQLite = require( "sqlite3" ).verbose();

class DB {
    sqlite;

    constructor() {
        this.sqlite = SQLite;
    }

    openDB(){
        return new this.sqlite.Database('./games.db', (err) => {
            if (err) { console.error(err.message); }
        });
    }


    save( game, options = {} ) {
        let type = options.type || 'automatic';
        const db = this.openDB();
        db.run("REPLACE INTO games (game_id,save_type,players,created,data) VALUES( ?,?,json(?),?,json(?))", [ game.id, type, JSON.stringify( game.socketMap ), game.created, JSON.stringify( game ) ], (err, rows) => {
            if (err) { console.error(err.message) }
        });
        db.close();
    }


    async createTables(){
        const db = this.openDB();
        await db.run( "CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT, save_type TEXT, players TEXT, created INT, data TEXT, UNIQUE(game_id, save_type))" );
        db.close();
    }


    load( options = {} ){

        let limit = options.limit || 6;

        let db = this.openDB();
        let sql = `SELECT id, game_id, save_type, players, created, data FROM games ORDER BY created DESC LIMIT ${limit}`;
        let result, savedGames = [];

        return new Promise( ( resolve, reject ) => {
            db.all( sql, ( err, rows ) => {

                if (err){
                    console.error( err.message );
                    return db.close();
                }

                if( !rows.length ){
                    resolve( false );
                    return db.close();
                }

                rows.forEach( row => {
                    let save = row;
                    save.players = JSON.parse( row.players );
                    save.data = JSON.parse( row.data );
                    savedGames.push( save );
                });

                resolve( savedGames );
                db.close();
            });
        });
    }

}

module.exports = DB;
