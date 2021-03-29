let Card = require( './Card' );

class TotalWar extends Card {
    handle( faction ){
        _.forEach(faction.game().areas, (item , name) => {
            item.data.battle = true;
        });

        faction.data.attackBonus += 1;
    }

    clear( faction ){
        faction.data.attackBonus -= 1;
    }
}


module.exports = TotalWar;
