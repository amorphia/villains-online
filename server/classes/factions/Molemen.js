let Faction = require( './Faction' );


class Molemen extends Faction {
    name = 'molemen';

    constructor( owner, game ) {
        super( owner, game );

        // faction event triggers
       this.triggers = {
            "onCleanUp" : "clearTunnels",
            'onSetup' : 'setUpVariousBits',
        };

        this.capturedRewards = [
            { ap : 1, maxEnergy : 1 },
            { ap : 1, cardDraw : 1 },
            { ap : 1, maxEnergy : 1 },
            { ap : 2, cardDraw : 1 },
        ];

        //data
        this.data.name = this.name;
        this.data.title = "the Kingdom of the Molemen";
        this.data.focusDescription = "Capture enemy areas";
        this.data.championForcesEnemyAction = true;
        this.data.tunnels = [];
        this.data.deployCache = [];
        this.data.cardCache = [];
        this.data.flipableUnits = ['champion'];
        this.data.moleKing = null;

        // we can capture more tokens than usual, neat!
        this.data.captured.max = this.capturedRewards.length;

        // tokens
        this.tokens['dig'] = {
            count : 1,
            data : {
                influence: 1,
                type : 'dig',
                cost : 0,
                resource: 1,
                description: "Draw an action card, then discard a card from your hand. Place a tunnel marker in the area matching that card’s TARGET.",
                req : "This token may always be activated"
            }
        };
        this.tokens['deploy'].count = 5;
        this.tokens['card'].count = 5;

        // units
        this.units['goon'].count = 5;
        this.units['mole'].count = 6;
        this.units['patsy'].count = 5;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "The Mole King",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [9,9],
                cost: 1,
                killed : false,
                selected : false,
                toughness : true,
                flipped : false,
                hitsAssigned : 0,
                forceEnemyAction: true,
            }
        };
    }


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        // add additional tokens to our reserves
        this.upgradeVariableItems({
            reserves: this.data.tokens,
            cache: this.data.cardCache,
        });

        this.upgradeVariableItems({
            reserves: this.data.tokens,
            cache: this.data.deployCache,
        });

        this.sortTokens();
    }

    sortTokens(){
        const order = ['deploy', 'card', 'move', 'battle', 'dig'];
        this.data.tokens.sort((a, b) => {
            const aIndex = order.indexOf(a.type);
            const bIndex = order.indexOf(b.type);
            if( aIndex === bIndex ) return 0;
            return aIndex < bIndex ? -1 : 1;
        });
    }

    /**
     * Can we activate this token?
     *
     * @returns {boolean}
     */
    canActivateDig(){
        return true;
    }

    /**
     * Handle our invade token activation
     *
     * @param args
     */
    async activateDigToken( args ){

        // draw card
        this.drawCards(1, true );

        // discard card
        const response = await this.prompt('discard-card', {
            message: 'choose a card to discard to dig a tunnel',
            count : 1
        });

        const cards = this.discardCards( response.cards );
        const area = cards[0].target;

        // save tunnel
        this.data.tunnels.push(area);

        await this.game().timedPrompt('units-shifted', {
            message: `Digs a tunnel to the ${area}`,
            units: [{ type: 'tunnel', location: area, faction: this.name }]
        });

        // advance the game
        this.game().advancePlayer();
    }

    modifyDeployAreas(areas){
        // merge areas and tunnels, enforcing uniqueness
        return [...new Set([...areas, ...this.data.tunnels])];
    }

    clearTunnels(){
        this.data.tunnels = [];
    }

    setUpVariousBits(){
        this.setMoleKingData();
        this.setupDeployAndCardTokens();
    }

    /**
     * Remove the vines tokens we haven't unlocked yet from our reserves
     */
    setupDeployAndCardTokens(){
        this.setupVariableItems({
            value: 'deploy',
            reserves: this.data.tokens,
            cache: this.data.deployCache,
        });

        this.setupVariableItems({
            value: 'card',
            reserves: this.data.tokens,
            cache: this.data.cardCache,
        });
    }

    /**
     * On setup, make a convenience reference to kau
     */
    setMoleKingData(){
        this.data.moleKing = this.getChampion();
    }
}

module.exports = Molemen;
