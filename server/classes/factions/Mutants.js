let Faction = require( './Faction' );


class Mutants extends Faction {

    name = 'mutants';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
            "onAfterCombatStep" : "healOozes"
        };

        // data
        this.data.name = this.name;
        this.data.focusDescription = "Have many units in play";
        this.data.title = "The Undercity Awakens";
        this.data.upgradeDeploy = 0;
        this.data.flipableUnits = ['champion'];

        // tokens
        this.tokens['biomorph'] = {
            count: 2,
            data: {
                influence: 1,
                resource: 1,
                cost : 0,
                description: "Target player sacrifices a patsy in this area (you may choose yourself), if they do you may deploy a Mother Ooze to this area without paying its deploy cost.",
                req : "this token must be discarded if no player can sacrifice a unit here"
            }
        };

        // units
        this.units['goon'].count = 6;
        this.units['mole'].count = 6;
        this.units['talent'].count = 4;
        this.units['patsy'].count = 6;

        this.units['champion'] = {
            count: 6,
            data: {
                name: "Mother Ooze",
                toughness : true,
                flipped: false,
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [5],
                cost: 2,
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

        this.message( `wounded Mother Oozes heal, splitting off a new mother ooze` );

        for( let area of areasWithHealedOozes ){
            let args = {
                area: area,
                faction: this,
                player: this.playerId,
                free: true,
                unitTypes: ['champion'],
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
     * Can we activate our Biomorph token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateBiomorph( token, area ) {
        // are there any patsies here?
        return _.factionsWithUnitsInArea( this.game().data.factions, area, { type : 'patsy' } ).length;
    }


    /**
     * Handle activating a biomorph token
     *
     * @param args
     */
    async activateBiomorphToken( args ){

        // choose our target faction
        let targetFaction = await this.getBiomorphTargetFaction( args );

        // have that player sacrifice a patsy
        let response = await targetFaction.prompt( 'sacrifice-units', {
            count : 1,
            type : 'patsy',
            areas : [ args.area.name ]
        });

        // get the
        let unit = this.game().objectMap[response.units[0]];
        if( !unit ){
            this.message(`failed to morph a patsy`, { class : 'warning' } );
            return;
        }

        // kill the chosen unit
        await this.game().killUnit( unit, this );

        // deploy a mother ooze here
        let options = {
            area: args.area,
            faction: this,
            player: this.playerId,
            free : true,
            fromToken : true,
            deployLimit: 1,
            unitTypes: ['champion'],
        };
        let deployed = await this.deploy( options );

        this.game().advancePlayer();
    }


    /**
     * Allows the player to choose a faction to biomorph a patsy
     *
     * @param args
     * @returns {Faction}
     */
    async getBiomorphTargetFaction( args ){
        // get the players with patsies in the area
        let factions = _.factionsWithUnitsInArea( this.game().data.factions, args.area, { type : 'patsy' } );

        // abort if we have no options
        if( !factions.length ){
            this.message(`no patsies to morph`, { class : 'warning' } );
            return;
        }

        // if we have exactly one option then just return that faction
        if( factions.length === 1 ){
            return this.game().factions[ factions[0] ];
        }

        // prompt our player to choose a faction
        let response = await this.prompt( 'choose-victim', {
            areas : [args.area.name],
            faction: this.name,
            allowSelf : true,
            message: 'Choose a player to sacrifice a patsy',
            targetFactions : factions,
        });

        // return our chosen faction
        return this.game().factions[ response.faction ];
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
