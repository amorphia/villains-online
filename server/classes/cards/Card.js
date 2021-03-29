class Card {

    // abstracts
    handle(){}
    clear(){}

    async cardDeploy( faction, area, newArgs ) {
        let args = {
            area: area,
            faction: faction,
            player: faction.playerId,
        };
        Object.assign( args, newArgs );
        let output = await faction.deploy( args ).catch( error => console.error( error ) );
        if ( output && output.declined ) return;

        return output;
    }
}

module.exports = Card;
