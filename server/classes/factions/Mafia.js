let Faction = require( './Faction' );


class Mafia extends Faction {
    name = 'mafia';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
            "onStartOfTurn" : "chooseSpy",
            "onCleanUp" : "resetSpy"
        };

        // data
        this.data.name = this.name;
        this.data.spy = null; // the faction we are spying on
        this.data.title = "La Cosa Nostra";
        this.data.focusDescription = "Infiltrate or control enemy targets";

        //tokens
        this.tokens['hit-man'] = {
            count : 1,
            data : {
                influence: 1,
                resource: 1,
                cost : 0,
                req : "This token must be discarded if you have no targets to assign a hit to"
            }
        };

        // units
        this.units['talent'].count = 2;
        this.units['patsy'].count = 5;

        this.units['champion'] = {
            count: 1,
            data: {
                name: "The Fixer",
                skilled : true,
                ready: false,
                type: 'champion',
                onDeploy : 'fixerDeploy',
                basic: false,
                influence: 2,
                attack: [5],
                cost: 0,
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
        this.data.bonusDeploy = { type: 'champion', count: 1 };
    }


    /**
     * Choose an enemy to spy on their target
     */
    async chooseSpy(){
        // if we control the police we already spy on everyone
        if( this.areas().includes( 'police' ) ) return;

        return this.game().promise({
            players: this.playerId,
            name: 'choose-spy',
            data: {}
        }).then( ([player,response]) => {
            // set our spy faction
            this.data.spy = response.faction;
            this.game().updatePlayerData();
            this.message( `Is spying on the ${response.faction}` );
        }).catch( error => console.error( error ) );

    }


    /**
     * Reset the faction we are spying on end of turn trigger
     */
    resetSpy(){
        this.data.spy = null;
    }


    /**
     * Handle our onDeploy fixer triggered ability
     *
     * @param event
     */
    async fixerDeploy( event ){
        let fixer = event.unit;

        // ready the fixer
        if( !this.hasUsedSkill( fixer.location ) ){
            this.message(`<span class="faction-mafia">The Fixer</span> is ready for action` );
            fixer.ready = true;
        }

        /// if we don't have our second upgrade yet, then we are done
        if( this.data.upgrade !== 2) return;

        // the fixer makes an attack upon entering the area if we have our second upgrade
        let area = this.game().areas[ fixer.location ];
        let output = await this.attack( { area : area, attacks : fixer.attack , unit : event.unit, optional : true } ).catch( error => console.error( error ) );

        if( output ){
            await this.game().timedPrompt('noncombat-attack', { output : [output] } )
                .catch( error => console.error( error ) );
        }

    }


    /**
     * Can we activate our hitman token?
     *
     * @param token
     * @param area
     * @returns {boolean}
     */
    canActivateHitMan( token, area ) {
        // are there any basic units in this area that don't belong to us, and aren't hidden?
        return _.factionsWithUnitsInArea( this.game().factions, area, {
                    exclude : this.name,
                    basic : true,
                    notHidden : true }
                ).length > 0;
    }


    /**
     * Handle hit man token activation
     *
     * @param args
     */
    async activateHitManToken( args ){

        // get our victim
        let unit = await this.chooseHitmanVictim( args );
        if( !unit ) return;

        // apply the hit
        let result = await this.game().assignHitsToUnit( unit, this );
        this.game().sound( 'hit' );

        // display results
        this.message(`the hitman ${result} <span class="faction-${unit.faction}">the ${unit.faction}'s ${unit.name}</span> in <span class="highlight">the ${args.area.name}</span>` );

        // advance game
        this.game().advancePlayer();
    }


    /**
     * Choose the victim for our hitman token
     *
     * @param args
     */
    async chooseHitmanVictim( args ){
        // choose a unit to hit
        let response = await this.prompt( 'assassinate-unit', {
            faction : this.name,
            areas : [args.area.name]
        });

        // if we decline then pull the token and abort
        if( response.decline ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        // grab our unit object
        return this.game().objectMap[response.unit];
    }

}


module.exports = Mafia;
