let Faction = require( './Faction' );


class Bankers extends Faction {
    name = 'bankers';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
            "onStartOfTurn" : "gainBonusResources",
        };

        // data
        this.data.name = this.name;
        this.data.title = "Omni Financial Group";
        this.data.bonusResources = 2; // how many bonus resources to earn at the start of each turn
        this.data.focusDescription = "Control many areas";

        // tokens
        this.tokens['deploy'].count = 4;

        this.tokens['credit-freeze'] = {
            count : 1,
            data : {
                influence: 1,
                cost : 0,
                activateTax : true,
                areaStat : true,
                description : 'Enemy players must pay 1 each time they activate a token in this area',
                req : "Passive token: this token may always be activated"
            }
        };

        // units
        this.units['mole'].count = 6;
        this.units['goon'].count = 6;
        this.units['champion'] = {
            count: 1,
            data: {
                name: "The Gnome of Zurich",
                type: 'champion',
                basic: false,
                influence: 4,
                attack: [5, 5],
                cost: 2,
                killed : false,
                onHit : 'gainGnomeCash',
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
        // our bonus resources are 2/4/6 for 0/1/2 plans completed
        this.data.bonusResources =  ( upgrade * 2 ) + 2;
    }


    /**
     * Handle gnome successful attack trigger
     *
     * @param event
     */
    gainGnomeCash( event ){
        // gain resources equal to the hits scored
        this.gainResources( event.hits );
        this.message(`<span class="faction-bankers">The Gnome of Zurich</span> enriches the bankers` );
    }


    /**
     * Can we activate our freeze token?
     *
     * @returns {boolean}
     */
    canActivateCreditFreeze(){
        return true;
    }


    /**
     * Handle credit freeze token activation
     *
     * @param args
     */
    activateCreditFreezeToken( args ){
        // just advance the game, easy as pie
        this.game().advancePlayer();
    }


    /**
     * Gain bonus resources at the start of the turn
     */
    gainBonusResources(){
        this.gainResources( this.data.bonusResources );
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
            mods.push( { type : 'gnomeCash', text : `Gains xRx for each hit scored by the Gnome of Zurich` });
            mods.push( { type : 'gnomeDeflect', text : `May pay xC2x to cancel hits assigned to them` });
        }

        return mods;
    }

}


module.exports = Bankers;
