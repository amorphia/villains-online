let Faction = require( './Faction' );


class Commies extends Faction {
    name = 'commies';

    constructor( owner, game ) {
        super( owner, game );

        // data
        this.data.name = this.name;
        this.data.title = "The New Collective";
        //this.data.bonusPatsies = 1;
        this.data.bonusDeploy = { type: 'patsy', count : 1 };
        this.data.focusDescription = "Have high influence in areas";

        // tokens
        this.tokens['rise-up'] = {
            count : 1,
            data : {
                influence: 1,
                cost : 0,
                areaStat : true,
                description : 'communist patsies produce +1 influence in this area'
            }
        };

        // units
        this.units['goon'].count = 4;
        this.units['mole'].count = 4;
        this.units['talent'].count = 2;
        this.units['patsy'].count = 12;
        this.units['champion'] = {
            count: 1,
            data: {
                name: "Commissar Papova",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [5],
                cost: 1,
                skilled: true,
                ready: false,
                killed : false,
                onSkill : 'papovMove',
                selected : false,
                hitsAssigned : 0
            }
        };
    }

    async papovMove( event ){
        this.message({ message: `<span class="faction-commies">Commissar Papova</span> calls for reinforcements` });
        await this.move({
            area: this.game().areas[event.unit.location],
            toArea : event.unit.location,
            fromToken: false,
            moveLimit: 3,
            farMove: true,
            player : this.playerId
        }).catch( error => console.error( error ) );
    }

    riseUpToken( args ){
        this.game().advancePlayer();
    }

    canActivateRiseUp(){
        return true;
    }

    processUpgrade( n ){
        this.data.bonusDeploy.count = n + 1;
    }

}

module.exports = Commies;
