let Faction = require( './Faction' );


class Commies extends Faction {
    name = 'commies';

    constructor( owner, game ) {
        super( owner, game );

        // data
        this.data.name = this.name;
        this.data.title = "The New Collective";
        this.data.risePatsies = 0; // how many bonus patsies to deploy with our ride token
        this.data.bonusDeploy = { type: 'patsy', count : 1 };
        this.data.focus = 'influence-focus';
        this.data.focusDescription = "Have high influence in areas";

        // tokens
        this.tokens['rise-up'] = {
            count : 1,
            data : {
                influence: 1,
                cost : 0,
                areaStat : true,
                description : 'communist patsies produce +1 influence in this area',
                req : "Passive token: this token may always be activated"
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


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        // gain bonus patsies equal to our upgrade count
        this.data.risePatsies = upgrade;
    }


    /**
     * Handle Papov's skill triggered ability
     *
     * @param event
     */
    async papovMove( event ){
        this.message(`<span class="faction-commies">Commissar Papova</span> calls for reinforcements` );
        await this.move({
            area: this.game().areas[event.unit.location],
            toArea : event.unit.location,
            fromToken: false,
            moveLimit: 3,
            farMove: true,
            player : this.playerId
        }).catch( error => console.error( error ) );
    }


    /**
     * Can we activate our rise token?
     *
     * @returns {boolean}
     */
    canActivateRiseUp(){
        // heck yeah
        return true;
    }


    /**
     * Handle activating our rise up token
     *
     * @param args
     */
    async activateRiseUpToken( args ){

        // if we have any bonus rise patsies, deploy them
        if( !this.data.risePatsies ){
            await this.deploy( {
                area: args.area,
                faction: this,
                player: this.playerId,
                fromToken : true,
                noBonusUnits : true,
                deployLimit: this.data.risePatsies,
                unitTypes: ['patsy'],
            } );
        }

        // advance the game
        this.game().advancePlayer();
    }

}

module.exports = Commies;
