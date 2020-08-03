let Faction = require( './Faction' );


class Vampires extends Faction {
    name = 'vampires';

    constructor(owner, game) {
        super(owner, game);

        //data
        this.data.name = this.name;
        this.data.title = "The Czarkovian Aristocrats";
        this.data.batMove = 1;

        // icons
        this.data.statusIcon = 'vampires';
        this.data.statusDescription = 'has vampire units';



        // tokens
        this.tokens['feast'] = {
            count: 1,
            data: {
                influence: 1,
                type: 'feast',
                cost: 0,
            }
        };

        // units
        this.units['goon'].data.onHit = 'becomeVampire';
        this.units['talent'].data.onHit = 'becomeVampire';
        this.units['talent'].data.attack = [5];
        this.units['mole'].data.onHit = 'becomeVampire';
        this.units['mole'].data.attack = [7];
        this.units['patsy'].count = 6;
        this.units['patsy'].data.onHit = 'becomeVampire';
        this.units['patsy'].data.attack = [7];

        this.units['champion'] = {
            count: 1,
            data: {
                name: "Lilith",
                type: 'champion',
                basic: false,
                influence: 2,
                attack: [5,5],
                firstStrike: true,
                cost: 2,
                killed: false,
                selected: false,
                hitsAssigned: 0,
                onHit : 'becomeVampire'
            }
        };
    }

    factionCombatMods( mods, area ) {
        if (this.data.units.find(unit => _.unitInArea(unit, area, 'champion'))) {
            mods.push({
                type: 'lilithHeal',
                text: `If Lilith, Baroness of Czarkovia is assigned a hit while in vampire form, flip her face up rather than kill her`
            });
        }

        return mods;
    }

    processUpgrade( n ) {
        this.data.batMove = n + 1;
    }


    async onAfterReveal( token ){
        let player, data;
        let destinationAreaName = token.location;

        let potentialAreas = this.areasWithUnits({ flipped : true, excludesArea : destinationAreaName });

        if( !potentialAreas.length ) return;

        [player, data] = await this.game().promise({
            players: this.playerId,
            name: 'choose-units',
            data: {
                    count : 1,
                    areas : potentialAreas,
                    playerOnly : true,
                    flippedOnly : true,
                    canDecline : true,
                    message: `Fly a vampire to the ${destinationAreaName}?`
                }
            });

        if( data.decline ) return false;

        let unit = this.game().objectMap[ data.units[0] ];

        unit.location = destinationAreaName;
        this.game().sound( 'bats' );
        this.game().message({ faction : this, message: `Fly a vampire ${unit.name} to The ${destinationAreaName}` });

    }


    canActivateFeast( token, area ) {
        return this.feastAreas().length > 0;
    }

    feastAreas(){

        let areas = {};
        this.data.tokens.forEach( token => {
            if( token.type === 'deploy' && token.location && token.revealed ){
                let area = this.game().areas[token.location];
                let hasUnit = !! this.data.units.find( unit => _.unitInArea( unit, area.name ) );
                let hasCeaseFire = !! area.data.cards.find( card => card.class === 'cease-fire' );
                if( hasUnit && !hasCeaseFire ) areas[area.name] = true;
            }
        });

        return Object.keys( areas );
    }

    async feastToken( args ) {
        let data, player;
        let areas = this.feastAreas();

        for( let area of areas ){
            let message = `Feasts in The ${ area }`;
            this.message({ message: message, faction : this });

            // prompt player to select a unit
            [player, data] = await this.game().promise({
                players: this.playerId,
                name: 'choose-units',
                data: { count : 1,
                        areas : [area],
                        hasAttack: true,
                        playerOnly : true,
                        showEnemyUnits: true,
                        message: "Choose a unit to attack" }
                });

            let unit = this.game().objectMap[ data.units[0] ];

            // resolve attack with that unit
            let attackArea = this.game().areas[ unit.location ];
            await this.attack( { area : attackArea, attacks : unit.attack, unit : unit, selfAttack : true, noDecline : true } );
        }

        let message = `Has finished feasting`;
        this.message({ message: message, faction : this });
        this.game().advancePlayer();
    }

    becomeVampire( event ) {
        let unit = event.unit;

        if( !unit.flipped && !unit.killed ){
            unit.flipped = true;
            unit.attack = unit.attack.map( attack => attack - 2 );
            let message = `<span class="faction-vampires">${unit.name}</span> becomes a vampire in The ${unit.location}`;
            this.message({ message: message, faction : this });
        }
    }

    unitUnflipped( unit ) {
        unit.flipped = false;
        unit.attack = unit.attack.map( attack => attack + 2 );
    }

}


module.exports = Vampires;
