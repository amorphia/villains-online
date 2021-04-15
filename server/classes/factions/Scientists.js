let Faction = require( './Faction' );


class Scientists extends Faction {
    name = 'scientists';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
            "onCleanUp" : "resetFusionCount"
        };

        // data
        this.data.focusDescription = "Play many cards";
        this.data.name = this.name;
        this.data.title = "The Union of Mad Science";
        this.data.cardDraw = 4;
        this.data.fusion = 0; // tracks how may cards we have played with mr fusion each turn
        this.data.upgradeCardDraw = 0;
        this.data.flipableUnits = ['champion'];

        // tokens
        this.tokens['card'].count = 4;

        this.tokens['mr-fusion'] = {
            count: 1,
            data: {
                influence: 1,
                type : 'card',
                noLimit : true,
                cost : 0,
                req : "This token must be discarded if you don't play at least one card"
            }
        };

        // units
        this.units['goon'].count = 3;
        this.units['mole'].count = 4;
        this.units['talent'].count = 6;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Dr. Tyrannosaurus",
                flipped: false,
                toughness: true,
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [5,5],
                cost: 2,
                killed : false,
                onDeploy: 'drTyrannosaurusDeploy',
                onAttack: 'drTyrannosaurusDraw',
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
        this.data.cardDraw += upgrade - this.data.upgradeCardDraw;
        this.data.upgradeCardDraw = upgrade;
    }


    /**
     * Handle our Dr T attack trigger
     *
     * @param event
     */
    drTyrannosaurusDraw( event ){
        this.drawCards( 1, true );
        this.message(`<span class="faction-scientists">Dr Tyrannosaurus</span> learned a lot while playing with their food` );
    }


    /**
     * Handle our Dr T deployment trigger to start a combat
     *
     * @param event
     */
    async drTyrannosaurusDeploy( event ){
        let area = this.game().areas[ event.unit.location ];
        try {
            await this.game().battle( area );
        } catch( error ){
            console.error( error );
        }
    }


    /**
     * Reset our Fusion count for the turn
     */
    resetFusionCount(){
       this.data.fusion = 0;
    }


    /**
     * Handle activating our Mr. Fusion token
     *
     * @param args
     */
    async activateMrFusionToken( args ){
        let fusing = true;

        // keep playing cards until we decide to stop
        while( fusing ) {
            args.fusion = true;
            let output = await this.playACard( args );
            if( output && output.declined ) fusing = false;
            else {
                this.data.fusion++;
            }
        }

        // if we didn't play any cards at all, then discard this token
        if( this.data.fusion === 0 ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.game().advancePlayer();
    }


    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {
        if( this.data.units.find( unit => _.unitInArea( unit, area, { type : 'champion' } ) ) ){
            mods.push( { type : 'drCards', text : `Draws a card each time Dr. Tyrannosaurus attacks` });
        }

        return mods;
    }
}

module.exports = Scientists;
