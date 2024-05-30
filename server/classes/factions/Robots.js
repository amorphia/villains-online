let Faction = require( './Faction' );


class Robots extends Faction {

    name = 'robots';

    constructor( owner, game ) {
        super( owner, game );

        // triggered events
        this.triggers = {
            "onSetup": "setupKillFactionCapturedRewards",
        };

        // data
        this.data.name = this.name;
        this.data.title = "Rise of the Machines";
        this.data.upgradeAttackBonus = 0;
        this.data.focusDescription = "Exterminate areas";
        this.data.flipableUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];

        this.capturedRewards = [
            { ap : 1, resources : 2, cards : 1 },
            { ap : 1, resources : 2, cards : 1 },
            { ap : 1, resources : 1, cards : 1 },
            { ap : 2 },
        ];

        // tokens
        this.tokens['wild'] = {
            count: 4,
            data: {
                influence: 1,
                type: 'wild',
                cost : 0,
                description: "Treat this token as if it were any basic token when revealing it (once this action is resolved it reverts to being a WILD token)",
                req : "This token must be discarded if you can't activate the basic token type you select"
            }
        };
        this.tokens['deploy'].count = 2;
        this.tokens['card'].count = 2;
        delete this.tokens['battle'];
        delete this.tokens['move'];

        // units
        delete this.units['patsy'];

        Object.assign(this.units['goon'].data, {
            flipped: false,
            toughness: true,
            attack: [5, 5, 5],
            cost: 3
        });

        Object.assign(this.units['mole'].data, {
            flipped: false,
            toughness: true,
            attack: [9, 9],
        });

        Object.assign(this.units['talent'].data, {
            flipped: false,
            toughness: true,
            attack: [7, 7],
            cost: 2
        });

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Bully G.O.A.T",
                flipped: false,
                toughness: true,
                type: 'champion',
                basic: false,
                influence: 1,
                attack: [5, 5],
                cost: 2,
                ready: false,
                skilled: true,
                killed : false,
                onSkill : 'fireBullyGoat',
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
        this.data.attackBonus += upgrade - this.data.upgradeAttackBonus;
        this.data.upgradeAttackBonus = upgrade;
    }


    /**
     * Handle our bully goat skill trigger attack
     *
     * @param event
     */
    async fireBullyGoat( event ){

        // get areas with units
        let areas = this.areasWithEnemyUnits({ noCeaseFire : true }, event.unit.location );



        if( ! areas.length  ){
            this.message( "Bully G.O.A.T couldn't lock on to a target", { class: 'warning' });
            return;
        }

        this.message(`<span class="faction-robots">Bully G.O.A.T</span> is searching for targets` );

        // prompt player to select an area
        let response = await this.prompt( 'choose-area', {
            areas : areas,
            show: 'units',
            enemyOnly: true,
            message: "Choose an area to target with Bully G.O.A.T"
        });

        let area = this.game().areas[ response.area ];

        // resolve attack with that unit
        let output = await this.attack( { area : area, attacks : event.unit.attack, unit : event.unit } );

        if( output ){
            await this.game().timedPrompt('noncombat-attack', { output : [output] } )
                .catch( error => console.error( error ) );
        }
    }


    /**
     * Can we activate our wild token?
     *
     * @returns {boolean}
     */
    canActivateWild(){
        // heck yeah we can
        return true;
    }

    /**
     * Handle activating a wild token
     *
     * @param args
     */
    async activateWildToken( args ){

        args.fromToken = true;

        // determine if we can even play this type of token
        let tokenMethod = 'canActivate' + _.classCase( args.wildType );
        let canActivate = this[tokenMethod]( args.token, args.area );

        // if we can't activate this token type, abort
        if( !canActivate ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        // attempt to resolve our token action
        let success;
        switch( args.wildType ){
            case 'battle': success = await this.resolveWildBattle( args );
                break;
            case 'deploy': success = await this.resolveWildDeploy( args );
                break;
            case 'card': success = await this.resolveWildCard( args );
                break;
            case 'move': success = await this.resolveWildMove( args );
                break;
        }

        // if we didn't successfully resolve our token action, then remove this token
        if( !success ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.game().advancePlayer();
    }


    /**
     * Resolve a battle action with our wild token
     *
     * @param args
     */
    async resolveWildBattle( args ){
        await this.game().battle( args.area );
        return true;
    }


    /**
     * Resolve a deploy action with our wild token
     *
     * @param args
     */
    async resolveWildDeploy( args ){
        let output = await this.deploy( args );
        return output && !output.declined;
    }


    /**
     * Resolve a card action with our wild token
     *
     * @param args
     */
    async resolveWildCard( args ){
        let declined = false;
        let cardsPlayed = 0;

        while( cardsPlayed < this.data.cardLimit && !declined ) {
            let output = await this.playACard( args );
            if( output && output.declined ){
                declined = true;
            } else {
                cardsPlayed++;
            }
        }

        return cardsPlayed > 0;
    }


    /**
     * Resolve a move action with our wild token
     *
     * @param args
     */
    async resolveWildMove( args ){
        this.payCost( 2, true );
        let output = await this.move( args );
        return output && !output.declined;
    }


    /**
     * Generate display text for faction combat modifications
     *
     * @param mods
     * @param area
     * @returns {*}
     */
    factionCombatMods( mods, area ) {
        mods.push( { type : 'robotUnits', text : `Units all have toughness and throw an extra die` });
        return mods;
    }


}


module.exports = Robots;
