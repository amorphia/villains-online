let Area = require( './Area' );

class Capitol extends Area {

    constructor( name, game ) {
        super( name, game );

        this.data.maxTokens = 6;
        this.data.control = "Collect this turn's Capitol Token";
        this.data.skill = "Exchange the position of two action tokens in the same area";
        this.data.adjacent = [ 'sewers', 'police', 'laboratory', 'factory', 'bank', 'university', 'subway', 'church' ];
    }

    onControl( faction ){
        let token = faction.game().capitolTokens[ this.game().data.turn - 1 ];
        faction.data.capitolTokens.push( token );
        faction.gainAP( token.ap );

        this.game().message({
            message: `Collects this turn's capitol token`,
            type : 'capitol-token',
            faction : faction,
            turn : this.game().data.turn
        });
        return token;
    }


    async skill( faction ){
        let player = {}, data = {};

        // get legal areas
        let areasWithTwoTokens = this.areasWithTwoTokens();
        if( ! areasWithTwoTokens.length  ){
            faction.game().message({
                message: "No areas with 2+ tokens to swap",
                class: 'warning'
            });
            return false;
        }

        // player chooses tokens
        [player, data] = await faction.game().promise({
            players: faction.playerId,
            name: 'choose-tokens',
            data : {
                count : 2,
                areas : areasWithTwoTokens,
                sameArea : true
            }
        }).catch( error => console.error( error ) );

        // swap tokens
        let tokens = [];
        data.tokens.forEach( token => tokens.push( faction.game().objectMap[ token ] ) );
        this.swapTokens( tokens, player, faction );
    }

    areasWithTwoTokens(){
        let areasWithTwoTokens = {};
        _.forEach( this.game().data.areas, area => {
            if( area.tokens.length >= 2 ) areasWithTwoTokens[area.name] = true;
        });
        return Object.keys( areasWithTwoTokens );
    }

    swapTokens( tokens, player, faction ){

        if( tokens.length !== 2 || tokens[0].location !== tokens[1].location ){
            this.game().message({
                message: "Token count wrong, or token locations don't match",
                class: 'warning'
            });
            return;
        }

        let area = this.game().data.areas[tokens[0].location];
        let tokenZeroIndex = _.findIndex( area.tokens, token => token.id === tokens[0].id );
        let tokenOneIndex = _.findIndex( area.tokens, token => token.id === tokens[1].id );

        area.tokens[tokenZeroIndex] = tokens[1];
        area.tokens[tokenOneIndex] = tokens[0];

        this.game().message({
            faction: faction,
            message: `swaps <span class="faction-${tokens[0].faction}">the ${tokens[0].faction}</span> token with <span class="faction-${tokens[1].faction}">the ${tokens[1].faction}</span> token in the ${area.name}` });
    }

}

module.exports = Capitol;
