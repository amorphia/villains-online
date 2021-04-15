let Faction = require( './Faction' );


class Aliens extends Faction {
    name = 'aliens';

    constructor( owner, game ) {
        super( owner, game );

        //data
        this.data.name = this.name;
        this.data.title = "The Centari Invasion";
        this.data.kau = null; // a reference for kau, so we can access it easier down the line
        this.data.focusDescription = "Capture many enemy markers";
        this.data.teleports = true; // our units cannot be prevented from entering or leaving areas
        this.data.flipableUnits = ['champion'];

        this.capturedRewards = [
            { ap : 1, maxEnergy : 1 },
            { ap : 1, cardDraw : 1 },
            { ap : 1, maxEnergy : 1 },
            { ap : 1, cardDraw : 1 },
            { ap : 1 },
            { ap : 1, pp : 1 },
        ];

        // we can capture more tokens than usual, neat!
        this.data.captured.max = this.capturedRewards.length;

        // tokens
        this.tokens['invade'] = {
            count : 1,
            data : {
                influence: 1,
                type : 'deploy',
                noLimit : true,
                cost : 0,
                req : "This token must be discarded if you don't deploy at least one unit"
            }
        };
        this.tokens['deploy'].count = 1;
        this.tokens['move'].count = 2;

        // units
        this.units['goon'].count = 3;
        this.units['mole'].count = 8;
        this.units['patsy'].count = 2;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Kau the Omnipotent",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [1],
                cost: 1,
                killed : false,
                selected : false,
                toughness : true,
                flipped : false,
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
        let moveCost = upgrade === 1 ? 1 : 0;
        this.data.tokens.forEach( token => {
            if( token.type === 'move' ) token.cost = moveCost;
        });
    }


    /**
     * Handle our invade token activation
     *
     * @param args
     */
    async activateInvadeToken( args ){

        // deploy, but with a deployLimit of 17
        args.deployLimit = 17;
        let output = await this.deploy( args );

        // if we didn't deploy anything, discard the token
        if( output?.declined ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        // advance the game
        this.game().advancePlayer();
    }


    /**
     * On setup, make a convenience reference to kau
     */
    onSetup(){
        this.data.kau = this.getChampion();
    }
}

module.exports = Aliens;
