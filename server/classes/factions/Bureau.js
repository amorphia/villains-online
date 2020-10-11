let Faction = require( './Faction' );


class Bureau extends Faction {
    name = 'bureau';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Bureau of Eternity";
        this.data.focus = 'most-tokens-focus';
        this.data.focusDescription = "Have the most tokens in many areas";

        this.data.upgradeSacrifice = 0;
        this.data.deployLimit = 1;
        this.data.bonusDeploy = { type: 'champion', count : 1 };

        // icons
        this.data.statusIcon = 'charged';
        this.data.statusDescription = 'has charged units';


        // tokens
        this.tokens['loop'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'loop',
                cost: 0,
            }
        };

        // units
        this.units['goon'].count = 4;
        this.units['goon'].data.onDeploy = 'becomeCharged';
        this.units['mole'].count = 4;
        this.units['mole'].data.onDeploy = 'becomeCharged';
        this.units['talent'].data.onDeploy = 'becomeCharged';
        this.units['patsy'].count = 3;
        this.units['patsy'].data.onDeploy = 'becomeCharged';


        this.units['champion'] = {
            count: 1,
            data: {
                name: "Minister",
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [6],
                firstStrike: true,
                charged : true,
                cost: 0,
                killed: false,
                selected: false,
                hitsAssigned: 0,
            }
        };
    }

    factionCombatMods( mods, area ) {

        if ( this.data.units.find( unit => _.unitInArea( unit, area, { flipped : true } ) ) ) {
            mods.push({
                type: 'chargedFirstStrike',
                text: `Charged units have first strike and return during cleanup if killed`
            });
        }

        return mods;
    }


    processUpgrade( n ) {
        this.data.upgradeSacrifice = n;
    }




    canActivateLoop( token, area ) {
        return true;
    }

    async loopAction( area ){
        let player, data;

        // todo
    }


    loopToken() {
        this.game().advancePlayer();
    }


    reviveChargedUnits(){
        // todo
    }


    becomeCharged( event ) {
        let unit = event.unit;

        if( !event.from ){
            unit.flipped = true;
            unit.charged = true;
            unit.firstStrike = true;
            unit.influence++;
        }
    }


    unitUnflipped( unit ) {
        unit.flipped = false;
        unit.firstStrike = false;
        unit.influence--;
    }

}


module.exports = Bureau;
