let Faction = require( './Faction' );


class Robots extends Faction {

    name = 'robots';

    constructor( owner, game ) {
        super( owner, game );

        // data
        this.data.name = this.name;
        this.data.title = "Rise of the Machines";
        this.data.upgradeAttackBonus = 0;
        this.data.focus = 'exterminate-focus';
        this.data.focusDescription = "Exterminate areas";
        this.data.flippedUnits = ['patsy', 'goon', 'mole', 'talent', 'champion'];

        // tokens
        this.tokens['wild'] = {
            count: 4,
            data: {
                influence: 1,
                type: 'wild',
                cost : 0,
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

    factionCombatMods( mods, area ) {
        mods.push( { type : 'robotUnits', text : `Units all have toughness and throw an extra die` });
        return mods;
    }

    async fireBullyGoat( event ){
        let player, data;

        // get areas with units
        let areas = this.areasWithEnemyUnits({ adjacent : event.unit.location } );

        if( ! areas.length  ){
            this.game().message({ faction : this, message: "Bully G.O.A.T couldn't lock on to a target", class: 'warning' });
            return false;
        }

        this.message({ message: `<span class="faction-robots">Bully G.O.A.T</span> is searching for targets` });

        // prompt player to select a unit
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-area',
            data : {
                areas : areas,
                show: 'units',
                enemyOnly: true,
                message: "Choose an area to target with Bully G.O.A.T"
            }
        }).catch( error => console.error( error ) );
        let area = this.game().areas[ data.area ];

        // resolve attack with that unit
        let output = await this.attack( { area : area, attacks : event.unit.attack, unit : event.unit } );

        if( output ){
            await this.game().timedPrompt('noncombat-attack', { output : [output] } )
                .catch( error => console.error( error ) );
        }
    }

    async wildToken( args ){
        let player, data, output;
        let cardsPlayed = 0;

        /*
        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-wild',
            data : { area : args.area.name }
        }).catch( error => console.error( error ) );

        this.game().message({ message : `have chosen to treat their <span class="faction-robots">wild</span> token as a ${data.type} token`, faction : this });
         */

        let tokenMethod = 'canActivate' + _.classCase( args.wildType );
        let canActivate = this[tokenMethod]( args.token, args.area );
        args.fromToken = true;

        switch( args.wildType ){
            case 'battle':
                if( canActivate ){
                    await this.game().battle( args.area );
                    output = {};
                }
                break;
            case 'deploy':
                if( canActivate ) output = await this.deploy( args );
                break;
            case 'card':
                if( canActivate ){
                    let declined = false;

                    while( cardsPlayed < this.data.cardLimit && !declined ) {
                        output = await this.playACard( args );
                        if( output && output.declined ) declined = true;
                        else {
                            cardsPlayed++;
                        }
                    }
                }
                break;
            case 'move':
                if( canActivate ) {
                    this.payCost(2, true);
                    output = await this.move(args);
                }
                break;
        }

        if( !canActivate || ( output && output.declined && !cardsPlayed ) ){
            this.game().declineToken( this.playerId, args.token, true );
            return;
        }

        this.game().advancePlayer();
    }


    processUpgrade( n ){
        this.data.attackBonus += n - this.data.upgradeAttackBonus;
        this.data.upgradeAttackBonus = n;
    }


    canActivateWild(){
        return true;
    }

}


module.exports = Robots;
