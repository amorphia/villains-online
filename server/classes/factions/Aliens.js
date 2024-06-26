let Faction = require( './Faction' );


class Aliens extends Faction {
    name = 'aliens';

    constructor( owner, game ) {
        super( owner, game );

        // faction event triggers
        this.triggers = {
            'onSetup' : 'setKauData'
        };

        //data
        this.data.name = this.name;
        this.data.title = "The Centari Invasion";
        this.data.kau = null; // a reference for kau, so we can access it easier down the line
        this.data.focusDescription = "Capture many enemy markers";
        this.data.teleports = true; // our units cannot be prevented from entering or leaving areas
        this.data.flipableUnits = ['champion'];

        this.capturedRewards = [
            { ap : 1, resources : 1, cards : 1 },
            { ap : 1, resources : 1, cards : 1 },
            { ap : 1, resources : 1, cards : 1 },
            { ap : 1, resources : 1, cards : 1 },
            { ap : 1, resources : 1, cards : 1 },
            { ap : 2 },
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
                description: "Treat as a basic DEPLOY token in every way, except you have no deploy limit for this action.",
                req : "This token must be discarded if you don't deploy at least one unit"
            }
        };
        this.tokens['deploy'].count = 2;
        this.tokens['move'].count = 2;

        // units
        this.units['goon'].count = 3;
        this.units['mole'].count = 8;

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
     * Can we activate this card token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateInvade( token, area ){
        return this.canActivateDeploy();
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
    setKauData(){
        this.data.kau = this.getChampion();
    }
}

module.exports = Aliens;
