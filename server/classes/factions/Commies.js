let Faction = require( './Faction' );


class Commies extends Faction {
    name = 'commies';

    constructor( owner, game ) {
        super( owner, game );

        // triggers
        this.triggers = {
            "onCleanUp" : "clearRiseBonus",
        };

        // data
        this.data.name = this.name;
        this.data.title = "The New Collective";
        //this.data.commisarPatsyAttackValue = 7;
        this.data.risePatsies = 0; // how many bonus patsies to deploy with our ride token
        this.data.bonusDeploy = { type: 'patsy', count : 2 };
        this.data.focusDescription = "Have high influence in areas";
        this.data.riseAttackValue = 6;

        // tokens
        this.tokens['rise-up'] = {
            count : 1,
            data : {
                influence: 1,
                cost : 0,
                areaStat : true,
                resource : 1,
                description : `Communist patsies produce xIx in this area, and gain an attack of xA${this.data.riseAttackValue}x.`,
                req : "Passive token: this token may always be activated"
            }
        };

        // units
        this.units['goon'].count = 4;
        this.units['mole'].count = 4;
        this.units['talent'].count = 2;
        this.units['patsy'].count = 12;
        this.units['patsy'].data.onDeploy = "checkRiseToken";
        this.units['patsy'].data.onMove = "checkRiseToken";
        this.units['patsy'].data.onPlace = "checkRiseToken";

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Commissar Papova",
                type: 'champion',
                basic: false,
                influence: 3,
                attack: [3],
                cost: 1,
                skilled: true,
                ready: false,
                killed : false,
                //onSkill : 'papovMoveShoot',
                onSkill : 'papovMove',
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
        // gain bonus patsies equal to our upgrade count
        this.data.risePatsies = upgrade * 2;
    }


    /**
     * Handle Papov's skill triggered ability
     *
     * @param event
    */
    async papovMove( event ){
        this.message(`<span class="faction-commies">Commissar Papova</span> calls for reinforcements` );
        await this.move({
            area: this.game().areas[event.unit.location],
            toArea : event.unit.location,
            fromToken: false,
            canDecline: true,
            moveLimit: 3,
            farMove: true,
            player : this.playerId
        }).catch( error => console.error( error ) );
    }



    /**
     * Handle Papov's skill triggered ability
     *
     * @param event
     *
    async papovMoveShoot( event ){

        this.message(`<span class="faction-commies">Commissar Papova</span> calls for reinforcements` );

        await this.move({
            area: this.game().areas[event.unit.location],
            toArea : event.unit.location,
            fromToken: false,
            moveLimit: 3,
            canDecline: true,
            farMove: true,
            player : this.playerId
        }).catch( error => console.error( error ) );

        this.message(`<span class="faction-commies">Commissar Papova</span> inspires her patsies to riot` );

        let area = this.game().areas[event.unit.location];

        // get the count of patsies we have in this area, and if we have none abort
        let patsiesInArea = this.unitsInArea( area, { type : 'patsy' } );
        if( !patsiesInArea.length ){
            this.message( 'has no patsies to riot', { class : 'warning' } );
            return;
        }

        for( let unit of patsiesInArea ){
            // resolve attack with that unit
            await this.attack({
                area : area,
                attacks : unit.attack,
                unit : unit,
                attackBonus: 2,
            });
        }


       // await this.nonCombatAttack( this.data.commisarPatsyAttackValue, patsiesInAreaCount, area ).catch( error => console.error( error ) );
    }

    /**
     * Can we activate our rise token?
     *
     * @returns {boolean}
     */
    canActivateRiseUp(){
        // heck yeah
        return true;
    }

    becomeRisen( unit ){
        unit.attack = [this.data.riseAttackValue];
        unit.risen = true;
    }

    clearRisen( unit ){
        unit.attack = [];
        unit.risen = false;
    }

    /**
     * Handle activating our rise up token
     *
     * @param args
     */
    async activateRiseUpToken( args ){

        // if we have any bonus rise patsies, deploy them
        if( this.data.risePatsies ){
            await this.deploy( {
                area: args.area,
                faction: this,
                player: this.playerId,
                fromToken : true,
                noBonusUnits : true,
                deployLimit: this.data.risePatsies,
                unitTypes: ['patsy'],
            } );
        }

        this.data.units.forEach( unit => {
            if( _.unitInArea( unit, args.area, { type : "patsy" } ) ){
                this.becomeRisen( unit );
            }
        });

        // advance the game
        this.game().advancePlayer();
    }

    checkRiseToken( event ){
        let unit = event.unit;
        let riseLocation = this.data.tokens.find( token => token.type === "rise-up" && token.location && token.revealed )?.location;

        if( !riseLocation || riseLocation !== unit.location ){
            this.clearRisen( unit );
            return;
        }

        this.becomeRisen( unit );
    }

    clearRiseBonus() {
        this.data.units.forEach( unit => {
            if( unit.type === "patsy" ) this.clearRisen( unit );
        });
    }

    /**
     * Get a list of our faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {
        let riseLocation = this.data.tokens.find( token => token.type === "rise-up" && token.location && token.revealed )?.location;

        if( riseLocation === area.name ){
            mods.push({
                type: 'commieUpgrade',
                text: `The RISE token grants your patsies an attack of xA${this.data.riseAttackValue}x in this area`,
            });
        }

        return mods;
    }

}

module.exports = Commies;
