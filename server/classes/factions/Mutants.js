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
        this.tokens['biomorph'] = {
            count: 1,
            data: {
                influence: 1,
                resource: 1,
                cost : 0,
                description: "An opponent of your choice sacrifices a patsy in this area (if able), if they do you may deploy a unit to this area without paying its unit cost.",
                req : "this token must be discarded if no player can sacrifice a patsy here"
            }
        };

        // units
        this.units['goon'].count = 6;
        this.units['mole'].count = 6;
        this.units['talent'].count = 4;
        this.units['patsy'].count = 5;

        this.units['champion'] = {
            count: 3,
            data: {
                name: "Mother Ooze",
                toughness: true,
                flipped: false,
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [5],
                cost: 1,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onWounded: 'onOoozeWounded',
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

    onOoozeWounded( unit ){
        //unit.influence = 2;
    }

    /**
     * Handle our Heal Oozes end of turn trigger
     */
    async healOozes(){

        // heal our oozes, and keep track of the areas where we did it
        let areasWithHealedOozes = this.getHealedOozeAreas();
        this.message( `wounded Mother Oozes heal` );

        /*
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
         */
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
        return _.factionsWithUnitsInArea( this.game().data.factions, area, { type : 'patsy', exclude : [ this.name ] } ).length;
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

        let options = {
            area: args.area.name,
            faction: this,
            player: this.playerId,
            free: true,
            deployLimit: 1,
        };

        // deploy the selected unit
        let output = await this.deploy( options );

        if ( output?.declined ){
            this.message( `declines to deploy a unit to the ${args.area.name}` );
        }

        this.game().advancePlayer();
    }

    /**
     * Handle unflipping a unit
     *
     * @param unit
     */
    unflipUnit( unit ){
        unit.influence = 1;
        unit.flipped = false;
    }

    /**
     * Allows the player to choose a faction to biomorph a patsy
     *
     * @param args
     * @returns {Faction}
     */
    async getBiomorphTargetFaction( args ){
        // get the players with patsies in the area
        let factions = _.factionsWithUnitsInArea( this.game().data.factions, args.area, { type : 'patsy', exclude : [ this.name ] } );

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
            allowSelf : false,
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

    }
}

module.exports = Mutants;
