let Faction = require( './Faction' );


class Mutants extends Faction {

    name = 'mutants';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
            "onCleanUp" : "healOozes"
        };

        // data
        this.data.name = this.name;
        this.data.focusDescription = "Have many units in play";
        this.data.title = "The Undercity Awakens";
        this.data.upgradeDeploy = 0;
        this.data.flipableUnits = ['champion'];

        // tokens
        this.tokens['biohazard'] = {
            count: 1,
            data: {
                influence: 1,
                resource: 1,
                cost : 0,
                areaStat : true,
                description : 'units suffer -2 to their attack rolls against you in this area',
                req : "Passive token: this token may always be activated"
            }
        };

        // units
        this.units['goon'].count = 6;
        this.units['mole'].count = 7;
        this.units['talent'].count = 4;
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


    /**
     * Process faction upgrade
     *
     * @param {number} upgrade
     */
    processUpgrade( upgrade ){
        this.data.deployLimit += ( upgrade - this.data.upgradeDeploy );
        this.data.upgradeDeploy = upgrade;
    }


    /**
     * Handle our Heal Oozes end of turn trigger
     */
    async healOozes(){

        // heal our oozes, and keep track of the areas where we did it
        let areasWithHealedOozes = this.getHealedOozeAreas();

        // if we didn't have any wounded oozes, then we are done here
        if( !areasWithHealedOozes.length ) return;

        this.message( `spawn units as their wounded Mother Oozes heal` );

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


    /**
     * heal our oozes, and keep track of the areas where we did it
     *
     * @returns {string[]}
     */
    getHealedOozeAreas(){
        let areasWithHealedOozes = {};

        this.data.units.forEach( unit => {
            if( _.unitInPlay( unit, { type : 'champion', flipped : true } ) ){
                areasWithHealedOozes[ unit.location ] = true;
                this.unflipUnit( unit );
            }
        });

        return Object.keys( areasWithHealedOozes );
    }


    /**
     * Can we activate our Biohazard token?
     *
     * @returns {boolean}
     */
    canActivateBiohazard() {
        // as a matter of fact, we can
        return true;
    }


    /**
     * Handle activating a biohazard token
     *
     * @param args
     */
    activateBiohazardToken( args ){
        this.game().advancePlayer();
    }


    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ){

        // defense mod from biohazard token
        if( this.hasBiohazardInArea( area ) ){
            let existingMod = mods.find( mod => mod.type === 'defenseBonus' );
            if( existingMod ){
                existingMod.val += 2;
                existingMod.text = `Enemies suffer -${existingMod.val} to their attack rolls`
            } else {
                mods.push( { type : 'defenseBonus', text : `Enemies suffer -2 to their attack rolls`, val : 2 });
            }
        }

        // mother ooze heal / deploy
        if( this.data.units.find( unit => _.unitInArea( unit, area, { type : 'champion' } ) ) ){
            mods.push( { type : 'motherOoze', text : `Wounded Mother Ooozes heal and spawn new units at the end of the turn` });
        }

        return mods;
    }
}

module.exports = Mutants;
