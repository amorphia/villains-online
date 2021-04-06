let Area = require( './Area' );

class University extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.control = "Your patsies are skilled";
        this.data.skill = "Look at each face-down action token in the area of your choice.";
        this.data.adjacent = [ 'bank', 'capitol', 'subway' ];
    }

    async skill( faction ){
        let player = {}, data = {};

        let areas = faction.game().areasWithUnrevealedTokens();

        if( ! areas.length  ){
            faction.game().message({
                faction : faction,
                message: "No areas with unrevealed tokens",
                class: 'warning'
            });
            return false;
        }

        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-area',
            data : {
                areas : areas,
                show : 'tokens',
                message : 'Choose area to spy on tokens'
            }
        }).catch( error => console.error( error ) );

        faction.data.tokenSpy.push( data.area );
        faction.game().message({
            faction : faction,
            message: `looks at the tokens in the ${data.area}`
        });
    }

    takeControl( faction ){
        faction.data.skilledPatsies = true;

        faction.data.units.forEach( unit => {
            if( unit.type === 'patsy' ) unit.skilled = true;
        });
    }

    loseControl( faction ){
        faction.data.skilledPatsies = false;

        faction.data.units.forEach( unit => {
            if( unit.type === 'patsy' && unit.skilled ){
                unit.skilled = false;
            }
        });
    }


}

module.exports = University;
