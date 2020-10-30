let Faction = require( './Faction' );


class Bankers extends Faction {
    name = 'bankers';

    constructor( owner, game ) {
        super( owner, game );

        // data
        this.data.name = this.name;
        this.data.resources = 2;
        this.data.title = "Omni Financial Group";
        this.data.bonusResources = 2;
        this.data.focus = 'control-focus';
        this.data.focusDescription = "Control many areas";

        // tokens
        this.tokens['credit-freeze'] = {
            count : 1,
            data : {
                influence: 1,
                cost : 0,
                activateTax : true,
                resource: true,
                areaStat : true,
                description : 'enemy players must pay 1 to activate a token here'
            }
        };

        // units
        this.units['mole'].count = 7;
        this.units['goon'].count = 7;
        this.units['patsy'].count = 4;
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

    factionCombatMods( mods, area ) {
        if( this.data.units.find( unit => _.unitInArea( unit, area, { type : 'champion' } ) ) ){
            mods.push( { type : 'gnomeCash', text : `Gains xRx for each hit scored by the Gnome of Zurich` });
            mods.push( { type : 'gnomeDeflect', text : `May pay xC2x to cancel hits assigned to them` });
        }

        return mods;
    }

    resourcesToCollect(){
        let resources = super.resourcesToCollect();
        return resources += this.data.bonusResources;
    }

    gainGnomeCash( event ){
        this.gainResources( event.hits );
        this.message({ message: `<span class="faction-bankers">The Gnome of Zurich</span> enriches the bankers` });
    }

    creditFreezeToken( args ){
        this.game().advancePlayer();
    }

    canActivateCreditFreeze(){
        return true;
    }

    processUpgrade( n ){
        this.data.bonusResources =  n * 2;
    }

    onSetup(){
    }

}


module.exports = Bankers;
