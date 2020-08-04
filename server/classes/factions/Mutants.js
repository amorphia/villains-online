let Faction = require( './Faction' );


class Mutants extends Faction {

    name = 'mutants';

    constructor( owner, game ) {
        super( owner, game );

        // data
        this.data.name = this.name;
        this.data.title = "The Undercity Awakens";
        this.data.upgradeDeploy = 0;

        // tokens
        this.tokens['biohazard'] = {
            count: 1,
            data: {
                influence: 1,
                resource: 1,
                cost : 0,
                areaStat : true,
                description : 'units suffer -2 to their attack rolls against you in this area'
            }
        };

        // units
        this.units['goon'].count = 6;
        this.units['mole'].count = 7;
        this.units['talent'].count = 3;
        this.units['patsy'].count = 5;

        this.units['champion'] = {
            count: 3,
            data: {
                name: "Mother Ooze",
                toughness : true,
                flipped: false,
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [],
                cost: 1,
                killed : false,
                selected : false,
                hitsAssigned : 0
            }
        };
    }

    factionCombatMods( mods, area ){

        if( this.hasBiohazardInArea( area ) ){
            let existingMod = mods.find( mod => mod.type === 'defenseBonus' );
            if( existingMod ){
                existingMod.val += 2;
                existingMod.text = `Enemies suffer -${existingMod.val} to their attack rolls`
            } else {
                mods.push( { type : 'defenseBonus', text : `Enemies suffer -2 to their attack rolls`, val : 2 });
            }
        }

        if( this.data.units.find( unit => _.unitInArea( unit, area, { type : 'champion' } ) ) ){
            mods.push( { type : 'motherOoze', text : `Wounded Mother Ooozes heal and spawn new units at the end of the turn` });
        }

        return mods;
    }

    async factionCleanUp(){

        let areasWithHealedOozes = {};
        this.data.units.forEach( unit => {
            if( unit.type === 'champion' && unit.flipped ){
                areasWithHealedOozes[ unit.location ] = true;
                unit.flipped = false;
            }
        });
        areasWithHealedOozes = Object.keys( areasWithHealedOozes );

        if( areasWithHealedOozes.length ){
            let message = `spawn units as their wounded Mother Oozes heal`;
            this.game().message({ faction: this, message: message });
        }

        for( let area of areasWithHealedOozes ){
                let args = {
                    area: area,
                    faction: this,
                    player: this.playerId,
                    free: true,
                    deployLimit: 1
                };

                await this.deploy( args );
        }
    }

    processUpgrade( n ){
        this.data.deployLimit += ( n - this.data.upgradeDeploy );
        this.data.upgradeDeploy = n;
    }

    biohazardToken( args ){
        this.game().advancePlayer();
    }

    canActivateBiohazard() {
        return true;
    }

}

module.exports = Mutants;
